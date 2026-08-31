const express = require('express');
const router = express.Router();
const openMeteoService = require('../services/openMeteoService');

// GET /api/open-meteo/forecast?latitude=21.1492&longitude=79.1613
router.get('/forecast', async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude) || 21.1492;
    const lon = parseFloat(req.query.longitude) || 79.1613;

    const data = await openMeteoService.fetchForecast(lat, lon);
    res.json({
      status: 'success',
      source: 'Open-Meteo Live Satellite & Meteorology API',
      latitude: lat,
      longitude: lon,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
