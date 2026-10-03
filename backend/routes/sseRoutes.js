const express = require('express');
const router = express.Router();
const {sseStreamHandler} = require('../controllers/sseController');

//SSE Streaming 
router.get('/stream', sseStreamHandler);

module.exports = router;

