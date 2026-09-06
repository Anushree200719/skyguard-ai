const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stationRoutes = require('../server/src/routes/stations');
const anomalyRoutes = require('../server/src/routes/anomalies');
const alertRoutes = require('../server/src/routes/alerts');
const simulationRoutes = require('../server/src/routes/simulation');
const analyticsRoutes = require('../server/src/routes/analytics');
const maintenanceRoutes = require('../server/src/routes/maintenance');
const openMeteoRoutes = require('../server/src/routes/openMeteo');

const app = express();

app.use(cors());
app.use(express.json());

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
    service: 'SkyGuard AI Express Backend (Vercel Serverless)',
    timestamp: new Date()
  });
});

module.exports = app;
