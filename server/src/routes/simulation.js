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

// POST /api/simulation/what-if
router.post('/what-if', (req, res) => {
  try {
    const { tempChange = 0, humChange = 0, presChange = 0 } = req.body;
    const t = Number(tempChange) || 0;
    const h = Number(humChange) || 0;
    const p = Number(presChange) || 0;

    const absT = Math.abs(t);
    const absH = Math.abs(h);
    const absP = Math.abs(p);

    // Continuous Anomaly Score calculation
    const rawDist = Math.sqrt(Math.pow(t / 5, 2) + Math.pow(h / 15, 2) + Math.pow(p / 8, 2));
    const anomalyScore = Number(Math.min(0.99, Math.max(0.04, rawDist / 2.5)).toFixed(2));
    const confidencePct = Math.min(99, Math.max(75, Math.round(82 + absT * 0.8 + absP * 0.4)));

    let anomalyExpected = false;
    let faultPossibility = "5% — Negligible (Nominal Baseline)";
    let alertLevel = "LOW";
    let classification = "NORMAL";
    const expectedResponse = [];
    let summary = "";

    // 1. Extreme Spike (> +12°C or < -12°C)
    if (absT >= 12.0) {
      anomalyExpected = true;
      alertLevel = "CRITICAL";
      classification = t > 0 ? "SENSOR_SPIKE" : "SENSOR_FREEZE";
      const probPct = Math.min(98, 85 + Math.round(absT));
      faultPossibility = `${probPct}% — Severe Sensor ${t > 0 ? 'Spike / Short Circuit' : 'Freezing / Telemetry Loss'}`;
      expectedResponse.push(`🚨 Extreme temperature jump of ${t > 0 ? '+' : ''}${t}°C exceeds physical diurnal rate-of-change limits (max 4°C/hr).`);
      expectedResponse.push(`⚠ Humidity delta (${h > 0 ? '+' : ''}${h}%) and pressure delta (${p > 0 ? '+' : ''}${p} hPa) fail to support such a rapid thermal anomaly.`);
      expectedResponse.push(`⚠ Spatial Consensus Engine will flag AWS station as CRITICAL and isolate sensor stream.`);
      summary = `A massive thermal jump of ${t > 0 ? '+' : ''}${t}°C represents a physical impossibility for standard meteorological conditions. Hardware failure or transducer short-circuit is extremely likely.`;
    }
    // 2. Severe Cyclonic / Storm Event (Pressure drop <= -5 hPa with humidity increase)
    else if (p <= -5.0 && (h >= 8.0 || t < -1.5)) {
      anomalyExpected = true;
      alertLevel = "CRITICAL";
      classification = "GENUINE_WEATHER_EVENT";
      faultPossibility = "12% — Low Fault Risk (High Probability of Genuine Extreme Squall / Low Pressure System)";
      expectedResponse.push(`🌀 Rapid atmospheric pressure drop of ${p} hPa indicates an approaching deep low-pressure system / storm front.`);
      expectedResponse.push(`✓ Humidity increase of +${h}% and temperature shift of ${t > 0 ? '+' : ''}${t}°C are in strong thermodynamic agreement.`);
      expectedResponse.push(`✓ Neighboring AWS stations within 50km are expected to observe matching barometric drops.`);
      summary = `The pressure drop of ${p} hPa coupled with +${h}% humidity shift strongly indicates a genuine severe weather event rather than a sensor malfunction.`;
    }
    // 3. Uncorrelated Heat Spike (+5°C to +12°C with non-negative humidity or no pressure drop)
    else if (t >= 5.0 && h >= -2.0) {
      anomalyExpected = true;
      alertLevel = "HIGH";
      classification = "POSSIBLE_SENSOR_FAULT";
      const probPct = Math.min(92, 70 + Math.round(t * 2));
      faultPossibility = `${probPct}% — Uncorrelated Sensor Drift / Calibration Error`;
      expectedResponse.push(`⚠ Temperature jump (+${t}°C) occurs without the expected physical drop in relative humidity (saturation vapor pressure violation).`);
      expectedResponse.push(`⚠ In an actual ambient heating event, relative humidity must decrease as temperature rises.`);
      expectedResponse.push(`⚠ Nearby station comparison will verify if this spike is localized hardware noise.`);
      summary = `Temperature rising by +${t}°C without a corresponding humidity drop violates diurnal psychrometric principles, pointing to sensor drift or enclosure heating.`;
    }
    // 4. Moderate Sensor Drift (+3°C to +5°C or -3°C to -5°C)
    else if (absT >= 3.0) {
      anomalyExpected = true;
      alertLevel = "WARNING";
      classification = "SENSOR_DRIFT";
      const probPct = Math.round(50 + absT * 6);
      faultPossibility = `${probPct}% — Gradual Sensor Drift / Degradation`;
      expectedResponse.push(`⚠ Moderate temperature shift of ${t > 0 ? '+' : ''}${t}°C detected.`);
      expectedResponse.push(`⚠ Humidity change of ${h > 0 ? '+' : ''}${h}% shows partial decoupling.`);
      expectedResponse.push(`ℹ Recommend monitoring sensor degradation trend over next 24 hours.`);
      summary = `A ${t > 0 ? '+' : ''}${t}°C shift introduces a moderate anomaly score (${anomalyScore}). Early-warning algorithms recommend preventive maintenance inspection.`;
    }
    // 5. Significant Pressure / Humidity Shift without large Temp change
    else if (absH >= 20.0 || absP >= 8.0) {
      anomalyExpected = true;
      alertLevel = "WARNING";
      classification = "MULTIVARIATE_INCONSISTENCY";
      faultPossibility = "45% — Parameter Inconsistency";
      expectedResponse.push(`⚠ Significant parameter shift detected: Humidity ${h > 0 ? '+' : ''}${h}%, Pressure ${p > 0 ? '+' : ''}${p} hPa.`);
      expectedResponse.push(`✓ Temperature remains relatively stable (${t > 0 ? '+' : ''}${t}°C).`);
      expectedResponse.push(`ℹ Atmospheric front or sensor recalibration event in progress.`);
      summary = `Substantial pressure/humidity shift (${p > 0 ? '+' : ''}${p} hPa, ${h > 0 ? '+' : ''}${h}%) with stable temperature creates a multivariate warning flag.`;
    }
    // 6. Nominal diurnal variation
    else {
      anomalyExpected = false;
      alertLevel = "LOW";
      classification = "NORMAL";
      faultPossibility = "3% — Negligible (Nominal Diurnal Variation)";
      expectedResponse.push(`✓ Temperature shift (${t > 0 ? '+' : ''}${t}°C) is well within learned station baseline bounds.`);
      expectedResponse.push(`✓ Humidity (${h > 0 ? '+' : ''}${h}%) and pressure (${p > 0 ? '+' : ''}${p} hPa) are physically consistent.`);
      expectedResponse.push(`✓ All AWS telemetry channels operating at peak reliability.`);
      summary = `Inputs (ΔT: ${t > 0 ? '+' : ''}${t}°C, ΔH: ${h > 0 ? '+' : ''}${h}%, ΔP: ${p > 0 ? '+' : ''}${p} hPa) represent normal environmental background noise. No action required.`;
    }

    res.json({
      status: 'success',
      tempChange: t,
      humChange: h,
      presChange: p,
      anomalyExpected,
      anomalyScore,
      confidence: confidencePct,
      sensorFaultPossibility: faultPossibility,
      alertLevel,
      classification,
      expectedResponse,
      summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
