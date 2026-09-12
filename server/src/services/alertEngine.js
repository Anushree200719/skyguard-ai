/**
 * SkyGuard AI - Intelligent Smart Alerts Engine
 * Evaluates telemetry stream, anomaly events, trust scores, sensor health diagnostics,
 * and Open-Meteo satellite comparisons to generate categorized alerts (INFO, WARNING, HIGH RISK, CRITICAL).
 * 
 * Features sliding-window deduplication to prevent repeated duplicate alerts.
 */
const mongoose = require('mongoose');
const store = require('../models/inMemoryStore');

const STATION_NAMES = {
  'AWS-101': 'New Delhi IMD Headquarters',
  'AWS-102': 'Gurugram Cyber City AWS',
  'AWS-103': 'Noida Sector 62 AWS',
  'AWS-104': 'Faridabad Industrial AWS',
  'AWS-201': 'Mumbai Colaba Observatory',
  'AWS-202': 'Pune Shivajinagar AWS',
  'AWS-301': 'Bengaluru IMD Center',
  'AWS-401': 'Chennai Nungambakkam AWS',
  'AWS-501': 'Kolkata Alipore AWS',
  'AWS-601': 'Hyderabad Begumpet AWS',
  'AWS-701': 'Nagpur Central Meteorology Station'
};

class AlertEngine {
  constructor() {
    // Deduplication cooldown window in milliseconds (5 minutes)
    this.DEDUP_COOLDOWN_MS = 5 * 60 * 1000;
  }

  /**
   * Generates smart alerts for a station if condition criteria are met and no recent duplicate exists.
   */
  async evaluateStationAlerts(stationId, observation = null, anomalies = [], trustDetails = null, sensorHealth = null, comparison = null) {
    const station = store.getStation(stationId) || { stationId, name: STATION_NAMES[stationId] || stationId };
    const stationName = station.name || STATION_NAMES[stationId] || stationId;
    const generatedAlerts = [];

    // Helper function to dispatch alert with deduplication
    const dispatchAlert = async (alertData) => {
      const dedupKey = alertData.dedupKey || `${stationId}_${alertData.sensor || 'overall'}_${alertData.title}`;
      
      // Check existing unacknowledged alerts for this station in store within cooldown window
      const recentAlerts = store.getAlerts({ station: stationId, limit: 100 });
      const now = Date.now();
      const existingDuplicate = recentAlerts.find(a => 
        !a.acknowledged && 
        a.dedupKey === dedupKey && 
        (now - new Date(a.timestamp).getTime()) < this.DEDUP_COOLDOWN_MS
      );

      if (existingDuplicate) {
        // Skip duplicate generation
        return null;
      }

      const newAlert = {
        stationId,
        stationName,
        sensor: alertData.sensor || 'overall',
        title: alertData.title,
        message: alertData.message,
        level: alertData.level || 'WARNING',
        explanation: alertData.explanation || 'Triggered by SkyGuard AI automated decision engine.',
        aiConfidence: alertData.aiConfidence || 0.94,
        anomalyId: alertData.anomalyId || null,
        dedupKey,
        acknowledged: false,
        timestamp: new Date().toISOString()
      };

      // Add to in-memory store
      const createdInMemory = store.addAlert(newAlert);

      // Save to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        try {
          const AlertModel = require('../models/Alert');
          await AlertModel.create(newAlert);
        } catch (err) {
          console.warn('MongoDB alert save note:', err.message);
        }
      }

      generatedAlerts.push(createdInMemory);
      return createdInMemory;
    };

    // -------------------------------------------------------------------------
    // 1. CRITICAL & HIGH ANOMALIES CHECK
    // -------------------------------------------------------------------------
    if (anomalies && anomalies.length > 0) {
      const recentAnomalies = anomalies.filter(a => (a.stationId === stationId || !a.stationId) && a.anomalyType !== 'GENUINE_WEATHER_EVENT');
      for (const anom of recentAnomalies.slice(-3)) {
        let level = 'HIGH RISK';
        if (anom.severity === 'CRITICAL' || anom.anomalyType === 'SENSOR_SPIKE' || anom.anomalyType === 'SENSOR_FROZEN') {
          level = 'CRITICAL';
        } else if (anom.severity === 'WARNING' || anom.severity === 'LOW') {
          level = 'WARNING';
        }

        const sensorName = (anom.sensor || 'temperature').toUpperCase();
        await dispatchAlert({
          sensor: anom.sensor || 'temperature',
          title: `${sensorName} Sensor Anomaly`,
          message: anom.whatHappened || `Current Value: ${anom.originalValue || 'Abnormal'} (Expected: ${anom.expectedRange || '30°C–36°C'})`,
          level,
          explanation: anom.shortExplanation || anom.probableCause || `Sudden ${anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ').toLowerCase() : 'sensor fault'} detected.`,
          aiConfidence: anom.confidence || 0.94,
          anomalyId: anom._id || null,
          dedupKey: `${stationId}_${anom.sensor || 'temperature'}_ANOMALY_${anom.anomalyType || 'FAULT'}`
        });
      }
    }

    // -------------------------------------------------------------------------
    // 2. SENSOR HEALTH DIAGNOSTICS CHECK
    // -------------------------------------------------------------------------
    if (sensorHealth && sensorHealth.sensors) {
      Object.entries(sensorHealth.sensors).forEach(async ([sensKey, sensObj]) => {
        if (sensObj.status === 'CRITICAL' || sensObj.status === 'OFFLINE' || sensObj.healthScore < 50) {
          await dispatchAlert({
            sensor: sensKey,
            title: `${sensKey.toUpperCase()} Sensor Hardware Critical`,
            message: `Sensor health degraded to ${sensObj.healthScore}% (${sensObj.status}). Last reading: ${sensObj.lastReading !== null ? sensObj.lastReading : 'N/A'}.`,
            level: sensObj.status === 'OFFLINE' ? 'CRITICAL' : 'HIGH RISK',
            explanation: sensObj.issues && sensObj.issues.length > 0 ? sensObj.issues.join('; ') : 'Hardware degradation or flatline detected.',
            aiConfidence: 0.95,
            dedupKey: `${stationId}_${sensKey}_HEALTH_POOR`
          });
        } else if (sensObj.status === 'UNSTABLE' || sensObj.healthScore < 70) {
          await dispatchAlert({
            sensor: sensKey,
            title: `${sensKey.toUpperCase()} Sensor Health Warning`,
            message: `Sensor health is at ${sensObj.healthScore}% (${sensObj.status}). Requires maintenance review.`,
            level: 'WARNING',
            explanation: sensObj.issues && sensObj.issues.length > 0 ? sensObj.issues.join('; ') : 'Minor instabilities detected.',
            aiConfidence: 0.91,
            dedupKey: `${stationId}_${sensKey}_HEALTH_WARN`
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 3. TRUST SCORE DROP CHECK
    // -------------------------------------------------------------------------
    if (trustDetails && trustDetails.overallScore !== undefined) {
      if (trustDetails.overallScore < 50) {
        await dispatchAlert({
          sensor: 'overall',
          title: `Station Data Trust Score Critical`,
          message: `Station Trust Score dropped significantly to ${trustDetails.overallScore}% (${trustDetails.statusLabel || 'CRITICAL'}).`,
          level: 'CRITICAL',
          explanation: `Multiple cumulative sensor penalties: ${trustDetails.factors ? trustDetails.factors.map(f => f.message).join('; ') : 'Severe telemetry unreliability.'}`,
          aiConfidence: 0.96,
          dedupKey: `${stationId}_overall_TRUST_CRITICAL`
        });
      } else if (trustDetails.overallScore < 75) {
        await dispatchAlert({
          sensor: 'overall',
          title: `Station Data Trust Score Caution`,
          message: `Station Trust Score dropped to ${trustDetails.overallScore}% (${trustDetails.statusLabel || 'CAUTION'}).`,
          level: 'WARNING',
          explanation: `Minor telemetry variance detected. Recommend checking spatial consensus and Open-Meteo agreement.`,
          aiConfidence: 0.90,
          dedupKey: `${stationId}_overall_TRUST_CAUTION`
        });
      }
    }

    // -------------------------------------------------------------------------
    // 4. OFFLINE SENSORS / MISSING TELEMETRY CHECK
    // -------------------------------------------------------------------------
    if (observation) {
      const nullSensors = [];
      ['temperature', 'humidity', 'pressure', 'windSpeed', 'rainfall'].forEach(key => {
        if (observation[key] === null || observation[key] === undefined) {
          nullSensors.push(key);
        }
      });

      if (nullSensors.length > 0) {
        await dispatchAlert({
          sensor: nullSensors[0],
          title: `Telemetry Signal Interruption / Offline Sensor`,
          message: `Missing telemetry packet for sensor(s): ${nullSensors.join(', ')}.`,
          level: 'CRITICAL',
          explanation: `Physical sensor disconnection or packet drop detected during transmission cycle.`,
          aiConfidence: 0.98,
          dedupKey: `${stationId}_${nullSensors.join('_')}_TELEMETRY_OFFLINE`
        });
      }
    }

    // -------------------------------------------------------------------------
    // 5. MAJOR OPEN-METEO DISCREPANCY CHECK
    // -------------------------------------------------------------------------
    if (comparison && comparison.items) {
      const majorDiffItem = comparison.items.find(it => 
        (it.parameter === 'temperature' && Math.abs(it.difference) >= 5.0) ||
        (it.parameter === 'humidity' && Math.abs(it.difference) >= 25.0)
      );

      if (majorDiffItem) {
        await dispatchAlert({
          sensor: majorDiffItem.parameter,
          title: `Major Disagreement with Open-Meteo Satellite`,
          message: `AWS ${majorDiffItem.parameter.toUpperCase()} reads ${majorDiffItem.awsValue}${majorDiffItem.unit} vs Open-Meteo ${majorDiffItem.meteoValue}${majorDiffItem.unit} (Δ ${majorDiffItem.difference}${majorDiffItem.unit}).`,
          level: 'HIGH RISK',
          explanation: `Significant variance between ground AWS sensor and satellite weather radar model.`,
          aiConfidence: 0.93,
          dedupKey: `${stationId}_${majorDiffItem.parameter}_OPENMETEO_DISCREPANCY`
        });
      }
    }

    return generatedAlerts;
  }
}

const alertEngine = new AlertEngine();
module.exports = alertEngine;
