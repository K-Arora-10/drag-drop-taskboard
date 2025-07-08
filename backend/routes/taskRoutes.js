const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createTask,
  getTasks,
  updateTaskWithConflict,
  deleteTask,
  smartAssign,
} = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTaskWithConflict);
router.delete('/:id', auth, deleteTask);
router.post('/smart-assign/:id', auth, smartAssign);

module.exports = router;
