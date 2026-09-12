const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const store = require('../models/inMemoryStore');

// GET /api/alerts/summary - Returns active alert counts grouped by severity
router.get('/summary', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const activeAlerts = await Alert.find({ acknowledged: false });
      if (activeAlerts) {
        return res.json({
          critical: activeAlerts.filter(a => a.level === 'CRITICAL').length,
          highRisk: activeAlerts.filter(a => a.level === 'HIGH RISK' || a.level === 'HIGH').length,
          warning: activeAlerts.filter(a => a.level === 'WARNING').length,
          info: activeAlerts.filter(a => a.level === 'INFO' || a.level === 'WEATHER_EVENT').length,
          totalActive: activeAlerts.length
        });
      }
    }
    return res.json(store.getAlertsSummary());
  } catch (err) {
    return res.json(store.getAlertsSummary());
  }
});

// GET /api/alerts - Query alerts with station, level/severity, acknowledged filters
router.get('/', async (req, res) => {
  try {
    const { station, stationId, level, severity, category, acknowledged, limit = 100 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      const targetStation = station || stationId;
      if (targetStation) query.stationId = targetStation;
      
      const targetLevel = level || severity || category;
      if (targetLevel) query.level = targetLevel;
      
      if (acknowledged !== undefined && acknowledged !== '') {
        query.acknowledged = acknowledged === 'true';
      }

      const dbAlerts = await Alert.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
      if (dbAlerts && dbAlerts.length > 0) return res.json(dbAlerts);
    }
    return res.json(store.getAlerts(req.query));
  } catch (err) {
    return res.json(store.getAlerts(req.query));
  }
});

// POST & PUT /api/alerts/:id/acknowledge
const acknowledgeHandler = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
      if (alert) return res.json(alert);
    }
    const updated = store.acknowledgeAlert(req.params.id);
    return res.json(updated || { _id: req.params.id, acknowledged: true });
  } catch (err) {
    const updated = store.acknowledgeAlert(req.params.id);
    return res.json(updated || { _id: req.params.id, acknowledged: true });
  }
};

router.post('/:id/acknowledge', acknowledgeHandler);
router.put('/:id/acknowledge', acknowledgeHandler);

module.exports = router;
