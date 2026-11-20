const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/ledger/mine -> Paginated user transaction ledger
router.get('/mine', ledgerController.getMyLedger);

// GET /api/ledger/summary -> Credits, heldCredits, total earned, total spent
router.get('/summary', ledgerController.getLedgerSummary);

module.exports = router;
