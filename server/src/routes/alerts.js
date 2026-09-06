const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const store = require('../models/inMemoryStore');

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const { acknowledged, limit = 50 } = req.query;
    const query = {};
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';

    const alerts = await Alert.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    if (alerts && alerts.length > 0) return res.json(alerts);
    res.json(store.getAlerts(req.query));
  } catch (err) {
    res.json(store.getAlerts(req.query));
  }
});

// POST /api/alerts/:id/acknowledge
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
    if (alert) return res.json(alert);
    const updated = store.acknowledgeAlert(req.params.id);
    res.json(updated || { status: 'acknowledged' });
  } catch (err) {
    const updated = store.acknowledgeAlert(req.params.id);
    res.json(updated || { status: 'acknowledged' });
  }
});

module.exports = router;
