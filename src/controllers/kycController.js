const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');

// @desc    Update user verification status
// @route   PUT /api/kyc/verify/:id
// @access  Private (Admin)
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const oldStatus = user.profile.verificationStatus;
    user.profile.verificationStatus = status;
    await user.save();

    res.json({ msg: `User ${user.username} verification status updated to ${status}`, user: user.profile });
    auditLogger(userId, 'kyc_status_update', 'User', user._id, { oldStatus, newStatus: status }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Upload verification documents
// @route   POST /api/kyc/upload-document
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    // Assuming Multer middleware has processed the file and it's available at req.file
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { documentType } = req.body; // e.g., 'id', 'passport', 'driver_license'

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // In a real application, you would upload the file to a cloud storage service (e.g., Cloudinary, S3)
    // For now, we'll just store a placeholder URL.
    const documentUrl = `/uploads/${req.file.filename}`; // Placeholder

    user.profile.documents.push({
      type: documentType,
      url: documentUrl,
      uploadedAt: Date.now()
    });
    user.profile.verificationStatus = 'pending'; // Set status to pending after document upload

    await user.save();

    res.json({ msg: 'Document uploaded successfully. Verification pending.', document: { type: documentType, url: documentUrl } });
    auditLogger(userId, 'kyc_upload', 'User', user._id, { documentType, documentUrl }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};