const BarterRequest = require('../models/BarterRequest');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { runInTransaction } = require('../utils/dbTransaction');

// POST /api/requests
exports.createRequest = async (req, res, next) => {
  try {
    const { skillId, hours, message, proposedSafeZone } = req.body;

    if (!skillId) {
      return res.status(400).json({ success: false, message: 'Skill ID is required' });
    }

    const numHours = parseInt(hours, 10);
    if (isNaN(numHours) || numHours < 1 || numHours > 4) {
      return res.status(400).json({ success: false, message: 'Hours must be an integer between 1 and 4' });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    if (skill.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This skill listing is currently closed' });
    }

    // Cannot request your own skill
    if (skill.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot initiate a barter request for your own skill listing' });
    }

    // Determine roles based on skill.kind
    let learnerId, providerId;
    if (skill.kind === 'offer') {
      learnerId = req.user._id;
      providerId = skill.owner;
    } else {
      // skill.kind === 'want'
      learnerId = skill.owner;
      providerId = req.user._id;
    }

    // Check for duplicate active (pending or accepted) request
    const existingActive = await BarterRequest.findOne({
      skill: skill._id,
      learner: learnerId,
      provider: providerId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'An active barter request for this skill is already in progress',
      });
    }

    // Compute cost server-side: NEVER trust client
    const cost = skill.creditsPerHour * numHours;

    // Soft check: if requester is the learner, check they have enough available credits
    if (req.user._id.toString() === learnerId.toString()) {
      const learner = await User.findById(learnerId);
      if (learner.credits < cost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient credits. You need ${cost} credits (you have ${learner.credits}).`,
        });
      }
    }

    const newRequest = await BarterRequest.create({
      skill: skill._id,
      learner: learnerId,
      provider: providerId,
      hours: numHours,
      credits: cost,
      message: message ? message.trim().slice(0, 300) : '',
      proposedSafeZone: proposedSafeZone || null,
      status: 'pending',
    });

    const populated = await BarterRequest.findById(newRequest._id)
      .populate('skill', 'title kind category creditsPerHour mode')
      .populate('learner', 'name email avatar credits')
      .populate('provider', 'name email avatar credits')
      .populate('proposedSafeZone', 'name description');

    res.status(201).json({
      success: true,
      message: 'Barter session request sent successfully',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/requests/:id/accept (Provider only, pending)
exports.acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await BarterRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Barter request not found' });
    }

    // Must be provider
    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the skill provider can accept this request' });
    }

    // Idempotent check: status must be pending
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept a request in '${request.status}' status` });
    }

    // Execute atomic escrow hold inside MongoDB transaction
    const updated = await runInTransaction(async (session) => {
      // Re-check status inside transaction to prevent double acceptance
      const currentReq = await BarterRequest.findById(id).session(session);
      if (!currentReq || currentReq.status !== 'pending') {
        throw new Error('Request state was modified or no longer pending');
      }

      // Atomically hold learner's credits: credits -> heldCredits
      const learner = await User.findOneAndUpdate(
        { _id: currentReq.learner, credits: { $gte: currentReq.credits } },
        {
          $inc: {
            credits: -currentReq.credits,
            heldCredits: currentReq.credits,
          },
        },
        { new: true, session }
      );

      if (!learner) {
        const error = new Error('Learner has insufficient credits');
        error.statusCode = 400;
        throw error;
      }

      // Record escrow_hold transaction in ledger
      await Transaction.create(
        [
          {
            user: learner._id,
            type: 'escrow_hold',
            amount: -currentReq.credits,
            balanceAfter: learner.credits,
            request: currentReq._id,
            note: `Escrow hold for session request (${currentReq.credits} credits)`,
          },
        ],
        { session }
      );

      currentReq.status = 'accepted';
      await currentReq.save({ session });

      return currentReq;
    });

    const populated = await BarterRequest.findById(updated._id)
      .populate('skill', 'title kind category creditsPerHour mode')
      .populate('learner', 'name email avatar credits heldCredits')
      .populate('provider', 'name email avatar credits')
      .populate('proposedSafeZone', 'name description');

    res.status(200).json({
      success: true,
      message: 'Request accepted. Credits placed into escrow hold.',
      request: populated,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// PATCH /api/requests/:id/reject (Provider only, pending)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await BarterRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Barter request not found' });
    }

    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the skill provider can reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject request in '${request.status}' status` });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Barter request rejected',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/requests/:id/cancel (Either party; refunds if accepted)
exports.cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const request = await BarterRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Barter request not found' });
    }

    // Either party can cancel
    if (request.learner.toString() !== userId && request.provider.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a party in this barter request' });
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: `Cannot cancel request in '${request.status}' status` });
    }

    const updated = await runInTransaction(async (session) => {
      const currentReq = await BarterRequest.findById(id).session(session);
      if (!currentReq || (currentReq.status !== 'pending' && currentReq.status !== 'accepted')) {
        throw new Error('Request status cannot be cancelled');
      }

      // If already accepted, refund learner's heldCredits -> credits
      if (currentReq.status === 'accepted') {
        const learner = await User.findOneAndUpdate(
          { _id: currentReq.learner, heldCredits: { $gte: currentReq.credits } },
          {
            $inc: {
              heldCredits: -currentReq.credits,
              credits: currentReq.credits,
            },
          },
          { new: true, session }
        );

        if (learner) {
          await Transaction.create(
            [
              {
                user: learner._id,
                type: 'refund',
                amount: currentReq.credits, // positive signed refund
                balanceAfter: learner.credits,
                request: currentReq._id,
                note: `Refund of held escrow credits from cancelled session`,
              },
            ],
            { session }
          );
        }
      }

      currentReq.status = 'cancelled';
      await currentReq.save({ session });

      return currentReq;
    });

    res.status(200).json({
      success: true,
      message: 'Barter request cancelled successfully',
      request: updated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/requests/:id/confirm (Either party, accepted)
exports.confirmRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const request = await BarterRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Barter request not found' });
    }

    if (request.learner.toString() !== userId && request.provider.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a party in this barter request' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: `Confirmation is only available for accepted sessions (current: ${request.status})` });
    }

    const updated = await runInTransaction(async (session) => {
      const currentReq = await BarterRequest.findById(id).session(session);
      if (!currentReq || currentReq.status !== 'accepted') {
        throw new Error('Request is no longer in accepted state');
      }

      // Mark the calling party's confirmed flag
      if (userId === currentReq.learner.toString()) {
        currentReq.learnerConfirmed = true;
      }
      if (userId === currentReq.provider.toString()) {
        currentReq.providerConfirmed = true;
      }

      // When BOTH confirmed, release escrow atomically
      if (currentReq.learnerConfirmed && currentReq.providerConfirmed) {
        // Learner: heldCredits -= cost
        const updatedLearner = await User.findOneAndUpdate(
          { _id: currentReq.learner, heldCredits: { $gte: currentReq.credits } },
          { $inc: { heldCredits: -currentReq.credits } },
          { new: true, session }
        );

        if (!updatedLearner) {
          throw new Error('Learner escrow balance inconsistent');
        }

        // Provider: credits += cost
        const updatedProvider = await User.findByIdAndUpdate(
          currentReq.provider,
          { $inc: { credits: currentReq.credits } },
          { new: true, session }
        );

        // Record both ledger entries
        await Transaction.create(
          [
            {
              user: currentReq.learner,
              type: 'escrow_release_out',
              amount: -currentReq.credits,
              balanceAfter: updatedLearner.credits,
              request: currentReq._id,
              note: `Payment released to ${updatedProvider.name} for completed session`,
            },
            {
              user: currentReq.provider,
              type: 'escrow_release_in',
              amount: currentReq.credits,
              balanceAfter: updatedProvider.credits,
              request: currentReq._id,
              note: `Payment received from ${updatedLearner.name} for completed session`,
            },
          ],
          { session }
        );

        currentReq.status = 'completed';
      }

      await currentReq.save({ session });
      return currentReq;
    });

    const populated = await BarterRequest.findById(updated._id)
      .populate('skill', 'title kind category creditsPerHour mode')
      .populate('learner', 'name email avatar credits heldCredits')
      .populate('provider', 'name email avatar credits')
      .populate('proposedSafeZone', 'name description');

    res.status(200).json({
      success: true,
      message: updated.status === 'completed'
        ? '🎉 Both parties confirmed! Credits successfully transferred.'
        : 'Session confirmed on your side. Waiting for peer confirmation.',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/mine?role=incoming|outgoing
exports.getMyRequests = async (req, res, next) => {
  try {
    const { role } = req.query;
    const userId = req.user._id;

    let filter = {};
    if (role === 'incoming') {
      filter.provider = userId;
    } else if (role === 'outgoing') {
      filter.learner = userId;
    } else {
      filter.$or = [{ learner: userId }, { provider: userId }];
    }

    const requests = await BarterRequest.find(filter)
      .populate('skill', 'title kind category creditsPerHour mode')
      .populate('learner', 'name email avatar credits')
      .populate('provider', 'name email avatar credits')
      .populate('proposedSafeZone', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};
