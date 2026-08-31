const express = require('express');
const router = express.Router();
const Anomaly = require('../models/Anomaly');
const store = require('../models/inMemoryStore');

// GET /api/anomalies
router.get('/', async (req, res) => {
  try {
    const { station, type, severity, limit = 100 } = req.query;
    const query = {};
    if (station) query.stationId = station;
    if (type) query.anomalyType = type;
    if (severity) query.severity = severity;

    const anomalies = await Anomaly.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json(anomalies);
  } catch (err) {
    res.json(store.getAnomalies(req.query));
  }
});

// GET /api/anomalies/:id
router.get('/:id', async (req, res) => {
  try {
    const anomaly = await Anomaly.findById(req.params.id);
    if (!anomaly) return res.status(404).json({ message: 'Anomaly not found' });
    res.json(anomaly);
  } catch (err) {
    const anoms = store.getAnomalies();
    const found = anoms.find(a => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Anomaly not found' });
    res.json(found);
  }
});

module.exports = router;
