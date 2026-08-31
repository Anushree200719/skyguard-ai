const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Observation = require('../models/Observation');
const Anomaly = require('../models/Anomaly');
const store = require('../models/inMemoryStore');

// GET /api/stations
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ stationId: 1 });
    res.json(stations);
  } catch (err) {
    res.json(store.getStations());
  }
});

// GET /api/stations/:id
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findOne({ stationId: req.params.id });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json(st);
  }
});

// GET /api/stations/:id/observations
router.get('/:id/observations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const observations = await Observation.find({ stationId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(observations.reverse());
  } catch (err) {
    res.json(store.getObservations(req.params.id, parseInt(req.query.limit) || 50));
  }
});

// GET /api/stations/:id/health
router.get('/:id/health', async (req, res) => {
  try {
    const station = await Station.findOne({ stationId: req.params.id });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({
      stationId: station.stationId,
      healthScore: station.healthScore,
      status: station.status,
      healthHistory: [],
      recentAnomalies: []
    });
  } catch (err) {
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json({
      stationId: st.stationId,
      healthScore: st.healthScore,
      status: st.status,
      healthHistory: [],
      recentAnomalies: store.getAnomalies({ station: st.stationId, limit: 10 })
    });
  }
});

module.exports = router;
