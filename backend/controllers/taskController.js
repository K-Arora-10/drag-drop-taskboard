const Task = require('../models/Task');
const ActionLog = require('../models/ActionLog');
const User = require('../models/User');

const logAction = async (userId, action, taskId) => {
  await ActionLog.create({ user: userId, action, task: taskId });
};

const createTask = async (req, res) => {
  const { title, description, priority } = req.body;
  const existing = await Task.findOne({ title });
  if (['Todo', 'In Progress', 'Done'].includes(title) || existing)
    return res.status(400).json({ message: 'Invalid or duplicate title' });

  const task = await Task.create({ title, description, priority });
  await logAction(req.user.id, 'created task', task._id);
  res.status(201).json(task);
};

const getTasks = async (req, res) => {
  const tasks = await Task.find().populate('assignedUser', 'username');
  res.json(tasks);
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, assignedUser } = req.body;
  if (title && ['Todo', 'In Progress', 'Done'].includes(title))
    return res.status(400).json({ message: 'Invalid title' });

  Object.assign(task, { title, description, status, priority, assignedUser });
  await task.save();
  await logAction(req.user.id, 'updated task', task._id);
  res.json(task);
};

const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  await logAction(req.user.id, 'deleted task', task._id);
  res.json({ message: 'Deleted' });
};

const smartAssign = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const users = await User.find();
  const counts = await Promise.all(users.map(async (user) => {
    const count = await Task.countDocuments({ assignedUser: user._id, status: { $ne: 'Done' } });
    return { user, count };
  }));

  const minUser = counts.sort((a, b) => a.count - b.count)[0].user;
  task.assignedUser = minUser._id;
  await task.save();
  await logAction(req.user.id, `smart assigned to ${minUser.username}`, task._id);
  res.json(task);
};


const updateTaskWithConflict = async (req, res) => {
  const clientUpdatedAt = new Date(req.body.updatedAt);
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const serverUpdatedAt = new Date(task.updatedAt);
  if (clientUpdatedAt < serverUpdatedAt) {
    return res.status(409).json({
      conflict: true,
      serverTask: task,
      message: 'Conflict detected',
    });
  }

  const { title, description, status, priority, assignedUser } = req.body;
  Object.assign(task, { title, description, status, priority, assignedUser });
  await task.save();
  await logAction(req.user.id, 'resolved conflict update', task._id);
  res.json(task);
};


module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  smartAssign,
  updateTaskWithConflict,
};

