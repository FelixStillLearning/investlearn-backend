const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const kycController = require('../controllers/kycController');
const multer = require('multer');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary destination

// @route   PUT /api/kyc/verify/:id
// @desc    Update user verification status
// @access  Private (Admin)
router.put(
  '/verify/:id',
  [auth, [
    check('status', 'Status is required').not().isEmpty()
  ]],
  kycController.updateVerificationStatus
);

// @route   POST /api/kyc/upload-document
// @desc    Upload verification documents
// @access  Private
router.post(
  '/upload-document',
  [auth, upload.single('document'), [
    check('documentType', 'Document type is required').not().isEmpty()
  ]],
  kycController.uploadDocument
);

module.exports = router;
