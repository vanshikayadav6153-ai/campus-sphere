const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authMiddleware } = require('../middleware/auth');

// All item routes are protected
router.use(authMiddleware);

// POST /api/items -> Create new item listing
router.post('/', itemController.createItem);

// GET /api/items -> Browse marketplace items
router.get('/', itemController.getItems);

// GET /api/items/mine -> Seller's own listings (MUST BE BEFORE /:id)
router.get('/mine', itemController.getMyItems);

// GET /api/items/:id -> Single item details
router.get('/:id', itemController.getItemById);

// PATCH /api/items/:id/status -> Update status (available | reserved | sold) - Seller only
router.patch('/:id/status', itemController.updateItemStatus);

// PUT /api/items/:id -> Edit item listing (Seller only)
router.put('/:id', itemController.updateItem);

// DELETE /api/items/:id -> Delete item listing (Seller only)
router.delete('/:id', itemController.deleteItem);

module.exports = router;
