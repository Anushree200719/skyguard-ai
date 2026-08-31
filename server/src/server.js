const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const stationRoutes = require('./routes/stations');
const anomalyRoutes = require('./routes/anomalies');
const alertRoutes = require('./routes/alerts');
const simulationRoutes = require('./routes/simulation');
const analyticsRoutes = require('./routes/analytics');
const maintenanceRoutes = require('./routes/maintenance');
const simulator = require('./services/simulator');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skyguard';

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/stations', stationRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SkyGuard AI Express Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Socket.IO event connection
io.on('connection', (socket) => {
  console.log(`📡 [Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`📡 [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Disable Mongoose buffering so failures fall back immediately to MemoryStore
mongoose.set('bufferCommands', false);

// MongoDB Connection & Server Start
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 })
  .then(() => {
    console.log('✅ Connected to MongoDB Database');
  })
  .catch((err) => {
    console.log(`ℹ️ Running with High-Performance Standalone MemoryStore (MongoDB daemon offline: ${err.message})`);
  });

server.listen(PORT, () => {
  console.log(`🚀 SkyGuard AI Server running on http://localhost:${PORT}`);
  simulator.initialize(io);
});
