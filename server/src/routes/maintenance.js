const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Anomaly = require('../models/Anomaly');
const store = require('../models/inMemoryStore');

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ healthScore: 1 });
    const priorityQueue = [];

    for (const st of stations) {
      if (st.healthScore >= 90) continue;

      const latestAnomaly = await Anomaly.findOne({ stationId: st.stationId }).sort({ timestamp: -1 });

      let priorityLevel = 'PRIORITY 3';
      let severity = 'MEDIUM';
      if (st.healthScore < 50 || st.status === 'CRITICAL') {
        priorityLevel = 'PRIORITY 1';
        severity = 'CRITICAL';
      } else if (st.healthScore < 70 || st.status === 'WARNING') {
        priorityLevel = 'PRIORITY 2';
        severity = 'HIGH';
      }

      priorityQueue.push({
        priority: priorityLevel,
        stationId: st.stationId,
        stationName: st.name,
        healthScore: st.healthScore,
        status: st.status,
        issue: latestAnomaly ? latestAnomaly.probableCause : 'Repeated sensor anomaly flags',
        recommendedAction: latestAnomaly ? latestAnomaly.recommendedAction : 'Recalibrate sensor element',
        severity
      });
    }

    res.json({
      totalMaintenanceRequired: priorityQueue.length,
      queue: priorityQueue
    });
  } catch (err) {
    const stations = store.getStations().sort((a, b) => a.healthScore - b.healthScore);
    const priorityQueue = [];

    for (const st of stations) {
      if (st.healthScore >= 90) continue;

      const anomalies = store.getAnomalies({ station: st.stationId });
      const latestAnomaly = anomalies[0];

      let priorityLevel = 'PRIORITY 3';
      let severity = 'MEDIUM';
      if (st.healthScore < 50 || st.status === 'CRITICAL') {
        priorityLevel = 'PRIORITY 1';
        severity = 'CRITICAL';
      } else if (st.healthScore < 70 || st.status === 'WARNING') {
        priorityLevel = 'PRIORITY 2';
        severity = 'HIGH';
      }

      priorityQueue.push({
        priority: priorityLevel,
        stationId: st.stationId,
        stationName: st.name,
        healthScore: st.healthScore,
        status: st.status,
        issue: latestAnomaly ? latestAnomaly.probableCause : 'Repeated sensor anomaly flags',
        recommendedAction: latestAnomaly ? latestAnomaly.recommendedAction : 'Recalibrate sensor element',
        severity
      });
    }

    res.json({
      totalMaintenanceRequired: priorityQueue.length,
      queue: priorityQueue
    });
  }
});

module.exports = router;
