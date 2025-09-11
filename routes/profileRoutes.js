const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is your profile page.` });
});

module.exports = router;
