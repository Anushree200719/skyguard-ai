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

// Support both /api/ route prefixes and bare routes on Vercel Serverless
app.use(['/api/stations', '/stations'], stationRoutes);
app.use(['/api/anomalies', '/anomalies'], anomalyRoutes);
app.use(['/api/alerts', '/alerts'], alertRoutes);
app.use(['/api/simulation', '/simulation'], simulationRoutes);
app.use(['/api/analytics', '/analytics'], analyticsRoutes);
app.use(['/api/maintenance', '/maintenance'], maintenanceRoutes);
app.use(['/api/open-meteo', '/open-meteo'], openMeteoRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'SkyGuard AI Express Backend (Vercel Serverless)',
    timestamp: new Date()
  });
});

module.exports = app;
