const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Auto-install node modules if missing
try {
  require.resolve('express');
} catch (e) {
  console.log('📦 Express or node_modules missing. Auto-installing npm dependencies...');
  const serverDir = path.resolve(__dirname, '..');
  const rootDir = path.resolve(__dirname, '../..');
  const targetDir = fs.existsSync(path.join(serverDir, 'package.json')) ? serverDir : rootDir;
  try {
    execSync('npm install --production --no-audit --no-fund', { stdio: 'inherit', cwd: targetDir });
  } catch (err) {
    console.error(`⚠️ npm install auto-recovery failed: ${err.message}`);
  }
}

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
const openMeteoRoutes = require('./routes/openMeteo');
const simulator = require('./services/simulator');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://skyguard-ai.vercel.app';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skyguard';

// Socket.IO setup with production CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Express CORS setup for REST API
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());


// API Routes
app.use('/api/stations', stationRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/open-meteo', openMeteoRoutes);

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
  console.log(`🚀 SkyGuard AI Server running on port ${PORT}`);
  simulator.initialize(io);
});
