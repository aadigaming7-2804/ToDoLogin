const express = require('express');
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Todo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const todo = new Todo({ title, description, completed, userId: req.user.id });
    await todo.save();
    res.json({ message: "Todo created!", todo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all Todos
router.get('/', authMiddleware, async (req, res) => {
  const todos = await Todo.find({ userId: req.user.id });
  res.json(todos);
});

// Get Todo by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// Update Todo
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, completed },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo updated!", todo });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// Delete Todo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted!" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;
