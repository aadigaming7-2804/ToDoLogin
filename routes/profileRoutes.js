const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); //  added
const authMiddleware = require('../middleware/authMiddleware');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');

//  Request admin approval for password reset
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

//  Reset password after admin approval
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

    user.password = newPassword;   // plain text
    user.approvedForReset = false;
    await user.save();              // pre('save') will hash it


    await PasswordResetRequest.deleteMany({ userId: user._id }); //  cleanup requests

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Get logged-in user's profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;
