const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/actions', require('./routes/actionRoutes'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('task-created', (task) => {
    socket.broadcast.emit('task-created', task);
  });

  socket.on('task-updated', (task) => {
    socket.to(task._id).emit('task-updated', task);
  });

  socket.on('task-deleted', (taskId) => {
    socket.broadcast.emit('task-deleted', taskId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('DB connection error:', err));
