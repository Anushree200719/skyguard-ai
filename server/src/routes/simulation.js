const express = require('express');
const router = express.Router();
const simulator = require('../services/simulator');

// POST /api/simulation/fault
router.post('/fault', (req, res) => {
  try {
    const { stationId, faultType, durationSeconds = 120, targetTemp } = req.body;
    if (!stationId || !faultType) {
      return res.status(400).json({ error: 'stationId and faultType are required' });
    }

    if (faultType === 'GENUINE_WEATHER_EVENT' && Array.isArray(stationId)) {
      simulator.injectMultiStationWeatherEvent(stationId, targetTemp);
    } else {
      simulator.injectFault({ stationId, faultType, durationSeconds, targetTemp });
    }

    res.json({
      status: 'success',
      message: `Fault ${faultType} injected successfully into ${Array.isArray(stationId) ? stationId.join(', ') : stationId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulation/speed
router.post('/speed', (req, res) => {
  try {
    const { speed = 1.0 } = req.body;
    simulator.setSpeed(parseFloat(speed));
    res.json({ status: 'success', speed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
