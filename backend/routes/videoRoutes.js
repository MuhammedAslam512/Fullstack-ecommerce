const express = require('express');
const router = express.Router();
const { streamVideo } = require('../controllers/videoController');

// Public Video Streaming Route
router.get('/stream/:filename', streamVideo);

module.exports = router;