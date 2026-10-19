const express = require('express');
const router = express.Router();
const { createDocument, getDocumentById } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember } = require('../middleware/tenant');
const { enforceDocumentLimit } = require('../middleware/metering');

router.use(protect);
router.use(requireWorkspaceMember);

router.post('/', enforceDocumentLimit,createDocument);
router.get('/:id', getDocumentById);

module.exports = router;