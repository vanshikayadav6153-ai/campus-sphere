const Skill = require('../models/Skill');
const { skillValidationSchema } = require('../utils/skillValidation');

// POST /api/skills
exports.createSkill = async (req, res, next) => {
  try {
    const parseResult = skillValidationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid skill data',
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { title, description, kind, category, creditsPerHour, mode, safeZone, status } = parseResult.data;

    const skill = await Skill.create({
      title,
      description,
      kind,
      category,
      creditsPerHour,
      mode,
      safeZone: mode === 'online' ? null : safeZone || null,
      status: status || 'open',
      owner: req.user._id,
    });

    const populatedSkill = await Skill.findById(skill._id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description locationType coordinates');

    res.status(201).json({
      success: true,
      message: 'Skill listing created successfully',
      skill: populatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/skills
// Query params: q, kind, category, mode, page, limit, status (default: 'open')
exports.getSkills = async (req, res, next) => {
  try {
    const { q, kind, category, mode, status = 'open' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status (default "open")
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by kind ('offer' | 'want')
    if (kind && (kind === 'offer' || kind === 'want')) {
      filter.kind = kind;
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filter by mode ('in-person', 'online', 'both')
    if (mode && mode !== 'all') {
      filter.mode = mode;
    }

    // Search query on title or description
    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    const total = await Skill.countDocuments(filter);
    const skills = await Skill.find(filter)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description locationType coordinates')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      skills,
      total,
      page,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/skills/mine
exports.getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ owner: req.user._id })
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description locationType coordinates')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      skills,
      total: skills.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/skills/:id
exports.getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description locationType coordinates');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/skills/:id
exports.updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    // Check ownership
    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this skill listing',
      });
    }

    const parseResult = skillValidationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid skill data',
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { title, description, kind, category, creditsPerHour, mode, safeZone, status } = parseResult.data;

    skill.title = title;
    skill.description = description;
    skill.kind = kind;
    skill.category = category;
    skill.creditsPerHour = creditsPerHour;
    skill.mode = mode;
    skill.safeZone = mode === 'online' ? null : safeZone || null;
    if (status) skill.status = status;

    await skill.save();

    const updatedSkill = await Skill.findById(skill._id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description locationType coordinates');

    res.status(200).json({
      success: true,
      message: 'Skill listing updated successfully',
      skill: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/skills/:id
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    // Check ownership
    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this skill listing',
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Skill listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
