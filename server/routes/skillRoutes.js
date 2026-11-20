const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authMiddleware } = require('../middleware/auth');

// All skill routes are protected by authMiddleware
router.use(authMiddleware);

// POST /api/skills -> Create new skill listing
router.post('/', skillController.createSkill);

// GET /api/skills -> Browse skills with filters & pagination
router.get('/', skillController.getSkills);

// GET /api/skills/mine -> Current user's skill listings (MUST BE BEFORE /:id)
router.get('/mine', skillController.getMySkills);

// GET /api/skills/:id -> Single skill detail
router.get('/:id', skillController.getSkillById);

// PUT /api/skills/:id -> Update skill listing (owner only)
router.put('/:id', skillController.updateSkill);

// DELETE /api/skills/:id -> Delete skill listing (owner only)
router.delete('/:id', skillController.deleteSkill);

module.exports = router;
