// ------------------------------------------------------
// VIDEO STREAMING CONTROLLER (HTTP 206 PARTIAL CONTENT)
// ------------------------------------------------------

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

/**
 * Stream Video in Chunks using HTTP Range Requests
 * GET /api/videos/stream/:filename
 */
const streamVideo = (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '../uploads', filename);

    // 1. Verify video file exists on disk
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found!'
      });
    }

    // 2. Get total file size from file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    // 3. Extract Range header from Browser Request (e.g., "bytes=0-")
    const range = req.headers.range;

    if (range) {
      // Parse Range Header (e.g. "bytes=1000000-")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      
      // Define Chunk Size (Default 1MB per chunk = 10^6 bytes)
      const CHUNK_SIZE = 1024 * 1024; 
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);

      //one chunk size 
      const contentLength = end - start + 1;

      // HTTP 206 Headers for Partial Content Streaming
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4'
      };

      // Write HTTP 206 Status
      res.writeHead(206, headers);

      // Create File Stream for the specific byte range ONLY (uses <1MB RAM!)
      const videoStream = fs.createReadStream(videoPath, { start, end });

      // Pipe video chunk to HTTP response
      videoStream.pipe(res);

    } else {
      // Fallback: If browser sends no Range header, return initial video stats header
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      };
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    logger.error(`Video streaming error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = {
  streamVideo
};