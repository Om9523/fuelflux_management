const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('FuelFlux API is running...');
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_pump', (pumpId) => {
    socket.join(pumpId);
    console.log(`User joined pump: ${pumpId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// DB Connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fuelflux')
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    // If mongo is not available, still start the server for development
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database Offline)`);
    });
  });

// Export io for use in controllers
module.exports = { app, io };
