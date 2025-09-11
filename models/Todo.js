const mongoose = require('./db');

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
module.exports = Todo;
