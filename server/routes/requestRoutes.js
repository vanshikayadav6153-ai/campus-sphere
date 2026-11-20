const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/requests -> Create new barter request
router.post('/', requestController.createRequest);

// GET /api/requests/mine -> View incoming or outgoing requests
router.get('/mine', requestController.getMyRequests);

// PATCH /api/requests/:id/accept -> Provider accepts (triggers escrow hold)
router.patch('/:id/accept', requestController.acceptRequest);

// PATCH /api/requests/:id/reject -> Provider rejects
router.patch('/:id/reject', requestController.rejectRequest);

// PATCH /api/requests/:id/cancel -> Cancel session (refunds escrow if accepted)
router.patch('/:id/cancel', requestController.cancelRequest);

// PATCH /api/requests/:id/confirm -> Either party confirms (releases escrow when both confirmed)
router.patch('/:id/confirm', requestController.confirmRequest);

module.exports = router;
