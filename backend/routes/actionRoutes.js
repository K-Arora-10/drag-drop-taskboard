const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getRecentActions } = require('../controllers/actionController');

router.get('/', auth, getRecentActions);

module.exports = router;
