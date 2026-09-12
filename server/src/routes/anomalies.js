const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Anomaly = require('../models/Anomaly');
const store = require('../models/inMemoryStore');

// GET /api/anomalies
router.get('/', async (req, res) => {
  try {
    const { station, type, severity, limit = 100 } = req.query;
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (station) query.stationId = station;
      if (type) query.anomalyType = type;
      if (severity) query.severity = severity;

      const anomalies = await Anomaly.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));
      if (anomalies && anomalies.length > 0) return res.json(anomalies);
    }
    return res.json(store.getAnomalies(req.query));
  } catch (err) {
    return res.json(store.getAnomalies(req.query));
  }
});

// GET /api/anomalies/:id
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const anomaly = await Anomaly.findById(req.params.id);
      if (anomaly) return res.json(anomaly);
    }
    const anoms = store.getAnomalies();
    const found = anoms.find(a => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Anomaly not found' });
    return res.json(found);
  } catch (err) {
    const anoms = store.getAnomalies();
    const found = anoms.find(a => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Anomaly not found' });
    return res.json(found);
  }
});

// GET /api/anomalies/:id/explain
router.get('/:id/explain', async (req, res) => {
  try {
    const XAIEngine = require('../services/xaiEngine');
    const anoms = store.getAnomalies();
    const found = anoms.find(a => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Anomaly not found' });

    const explanation = XAIEngine.generateAnomalyExplanation(found);
    return res.json(explanation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
