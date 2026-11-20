const Item = require('../models/Item');
const SafeZone = require('../models/SafeZone');

// PATCH /api/items/:id/status { status }
// Seller only; allowed values: "available" | "reserved" | "sold"
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['available', 'reserved', 'sold'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values are "available", "reserved", or "sold"',
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    // 403 for non-owner
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the seller can update this listing status',
      });
    }

    item.status = status;
    await item.save();

    const populated = await Item.findById(item._id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description coordinates icon safetyNote');

    res.status(200).json({
      success: true,
      message: `Item marked as ${status}`,
      item: populated,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/items -> Create item listing
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, type, price, rentPerDay, category, images, safeZone } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Title must be at least 3 characters' });
    }

    if (!type || !['sell', 'rent'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be "sell" or "rent"' });
    }

    if (!safeZone) {
      return res.status(400).json({ success: false, message: 'A designated campus safe pickup zone is required' });
    }

    const item = await Item.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      price: type === 'sell' ? Number(price) || 0 : 0,
      rentPerDay: type === 'rent' ? Number(rentPerDay) || 0 : 0,
      category: category || 'other',
      images: Array.isArray(images) ? images : [],
      safeZone,
      status: 'available',
      owner: req.user._id,
    });

    const populated = await Item.findById(item._id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description coordinates icon safetyNote');

    res.status(201).json({
      success: true,
      message: 'Item listing created successfully',
      item: populated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/items -> Browse marketplace items
// Query: q, category, type, status (default: 'available'), safeZone, page, limit
exports.getItems = async (req, res, next) => {
  try {
    const { q, category, type, safeZone, status = 'available' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = {};

    // By default hide sold items unless explicitly requested
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (type && (type === 'sell' || type === 'rent')) {
      filter.type = type;
    }

    if (safeZone && safeZone !== 'all') {
      filter.safeZone = safeZone;
    }

    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description coordinates icon safetyNote')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/items/mine (Defined BEFORE /:id)
exports.getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .populate('safeZone', 'name description coordinates icon safetyNote')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/items/:id
exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description coordinates icon safetyNote');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/items/:id (Seller only)
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not the owner of this item' });
    }

    const { title, description, type, price, rentPerDay, category, images, safeZone, status } = req.body;

    if (title) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (type) item.type = type;
    if (price !== undefined) item.price = Number(price);
    if (rentPerDay !== undefined) item.rentPerDay = Number(rentPerDay);
    if (category) item.category = category;
    if (images) item.images = images;
    if (safeZone) item.safeZone = safeZone;
    if (status && ['available', 'reserved', 'sold'].includes(status)) item.status = status;

    await item.save();

    const populated = await Item.findById(item._id)
      .populate('owner', 'name avatar email')
      .populate('safeZone', 'name description coordinates icon safetyNote');

    res.status(200).json({
      success: true,
      message: 'Item listing updated successfully',
      item: populated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/items/:id (Seller only)
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not the owner of this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
