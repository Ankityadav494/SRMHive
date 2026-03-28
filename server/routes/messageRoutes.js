const express = require('express');
const router = express.Router();

const { getProjectMessages, createMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', protect, getProjectMessages);
router.post('/project/:projectId', protect, createMessage);

module.exports = router;
