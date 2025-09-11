const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const permitRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// View all reset requests (admin only)
router.get('/reset-requests', authMiddleware, permitRoles('admin'), async (req, res) => {
  const requests = await User.find({ passwordResetRequest: true });
  res.json(requests);
});

// Approve a reset request (admin only)
router.post('/approve-reset/:id', authMiddleware, permitRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approvedForReset: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password reset approved", user });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;
