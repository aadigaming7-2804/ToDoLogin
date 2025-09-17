require('dotenv').config();            // Load .env variables
const express = require('express');
const bodyParser = require('body-parser');

// DB Connection
require('./models/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 4000;  // Use port from .env

app.use(bodyParser.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

