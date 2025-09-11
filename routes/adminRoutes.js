const express = require('express');
const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const authMiddleware = require('../middleware/authMiddleware');
const permitRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// View all reset requests
router.get('/reset-requests', authMiddleware, permitRoles('admin'), async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: 'pending' })
      .populate('userId', 'username email approvedForReset');
    res.json(requests);
  } catch (err) {
    console.error("reset-requests error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//  Approve a reset request
router.post('/approve-reset/:requestId', authMiddleware, permitRoles('admin'), async (req, res) => {
  try {
    const resetRequest = await PasswordResetRequest.findById(req.params.requestId);
    if (!resetRequest) return res.status(404).json({ message: "Reset request not found" });

    const user = await User.findByIdAndUpdate(
      resetRequest.userId,
      { approvedForReset: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    resetRequest.status = 'approved';
    await resetRequest.save();

    res.json({ message: "Password reset approved", user });
  } catch (err) {
    console.error("approve-reset error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
