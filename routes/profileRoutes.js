const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');
const { upload } = require('../config/cloudinary'); // multer-storage-cloudinary setup

// -------------------------------
// Request admin approval for password reset
// -------------------------------
router.post('/request-reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const existingRequest = await PasswordResetRequest.findOne({ userId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already submitted' });
    }

    const newRequest = new PasswordResetRequest({ userId, status: 'pending' });
    await newRequest.save();

    res.json({ message: 'Password reset request submitted' });
  } catch (err) {
    console.error("request-reset error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// -------------------------------
// Reset password after admin approval
// -------------------------------
router.post('/reset-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.approvedForReset) {
      return res.status(400).json({ message: "Reset not approved by admin yet" });
    }

    user.password = newPassword; // will be hashed via pre('save') in User model
    user.approvedForReset = false;
    await user.save();

    await PasswordResetRequest.deleteMany({ userId: user._id }); // cleanup requests

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -------------------------------
// Get logged-in user's profile
// -------------------------------
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -------------------------------
// Upload profile image (Cloudinary)
// -------------------------------
router.post('/upload-profile', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    //  Add these for debugging
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // req.file.path is already the Cloudinary URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile image uploaded successfully', user });
  } catch (err) {
    console.error('upload-profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
