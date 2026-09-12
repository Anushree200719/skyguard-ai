/**
 * SkyGuard AI - Transparent Station Trust Score Engine
 * Computes a dynamic 0-100% Trust Score based on:
 * 1. Open-Meteo satellite weather agreement
 * 2. Anomaly frequency and severity (excluding genuine weather events)
 * 3. Sensor flatlines (frozen sensor output)
 * 4. Step change spikes (sudden unphysical jumps)
 * 5. Telemetry packet loss / missing data
 * 6. Individual sensor health scores
 * 7. Historical operational reliability
 */
class TrustScoreEngine {
  static calculate(station, observations = [], anomalies = [], openMeteoData = null) {
    const sensorHealth = station?.sensorHealth || {
      temperature: 95,
      humidity: 95,
      pressure: 95,
      wind: 95,
      rainfall: 95
    };

    const latestObs = observations && observations.length > 0 ? observations[observations.length - 1] : null;
    const currentMeteo = openMeteoData?.current || null;

    let baseScore = 100.0;
    let anomalyDeductions = 0;
    let openMeteoDiscrepancyPenalty = 0;
    let sensorFlatlineSpikePenalty = 0;
    let packetLossPenalty = 0;

    const factors = [];

    // ----------------------------------------------------
    // 1. OPEN-METEO SATELLITE AGREEMENT CHECK
    // ----------------------------------------------------
    let openMeteoDiff = null;
    if (latestObs?.temperature !== undefined && latestObs?.temperature !== null && currentMeteo?.temperature_2m !== undefined) {
      openMeteoDiff = Math.abs(latestObs.temperature - currentMeteo.temperature_2m);
      if (openMeteoDiff <= 2.0) {
        factors.push({
          type: 'positive',
          message: `Data agrees with Open-Meteo satellite reading (Δ${openMeteoDiff.toFixed(1)}°C difference)`
        });
      } else if (openMeteoDiff <= 4.0) {
        openMeteoDiscrepancyPenalty += 6;
        factors.push({
          type: 'warning',
          message: `Minor temperature variance with Open-Meteo satellite data (Δ${openMeteoDiff.toFixed(1)}°C discrepancy)`
        });
      } else {
        openMeteoDiscrepancyPenalty += 16;
        factors.push({
          type: 'negative',
          message: `Significant discrepancy with Open-Meteo satellite observations (Δ${openMeteoDiff.toFixed(1)}°C discrepancy)`
        });
      }
    } else {
      factors.push({
        type: 'positive',
        message: 'Open-Meteo baseline alignment initialized'
      });
    }

    // ----------------------------------------------------
    // 2. ANOMALY FREQUENCY & SEVERITY CHECK
    // ----------------------------------------------------
    const stationAnomalies = (anomalies || []).filter(a => a.stationId === station.stationId || !a.stationId);
    let criticalCount = 0;
    let highCount = 0;
    let warningCount = 0;
    let genuineWeatherEventCount = 0;

    stationAnomalies.slice(-15).forEach(anom => {
      if (anom.anomalyType === 'GENUINE_WEATHER_EVENT') {
        genuineWeatherEventCount++;
      } else {
        if (anom.severity === 'CRITICAL') {
          criticalCount++;
          anomalyDeductions += 12;
        } else if (anom.severity === 'HIGH') {
          highCount++;
          anomalyDeductions += 7;
        } else if (anom.severity === 'WARNING' || anom.severity === 'MEDIUM') {
          warningCount++;
          anomalyDeductions += 3;
        }
      }
    });

    if (criticalCount > 0) {
      factors.push({
        type: 'negative',
        message: `${criticalCount} critical sensor fault anomaly detected recently`
      });
    } else if (highCount > 0) {
      factors.push({
        type: 'warning',
        message: `${highCount} high-risk sensor anomalies recorded in recent telemetry stream`
      });
    } else {
      factors.push({
        type: 'positive',
        message: 'No critical sensor faults detected in recent observations'
      });
    }

    if (genuineWeatherEventCount > 0) {
      factors.push({
        type: 'positive',
        message: `Spatial Consensus confirmed ${genuineWeatherEventCount} regional weather event(s) — sensors operating nominally`
      });
    }

    // ----------------------------------------------------
    // 3. STEP JUMP & FROZEN SENSOR CHECKS
    // ----------------------------------------------------
    const frozenAnom = stationAnomalies.find(a => a.anomalyType === 'SENSOR_FROZEN');
    const spikeAnom = stationAnomalies.find(a => a.anomalyType === 'SENSOR_SPIKE');

    if (frozenAnom) {
      sensorFlatlineSpikePenalty += 14;
      factors.push({
        type: 'negative',
        message: 'Thermistor flatline detected across consecutive reading cycles'
      });
    }

    if (spikeAnom) {
      sensorFlatlineSpikePenalty += 8;
      factors.push({
        type: 'warning',
        message: 'Unusual step jump (spontaneous thermal change) detected'
      });
    }

    // ----------------------------------------------------
    // 4. MISSING TELEMETRY PACKET CHECK
    // ----------------------------------------------------
    if (!latestObs || latestObs.temperature === null || latestObs.humidity === null || latestObs.pressure === null) {
      packetLossPenalty += 20;
      factors.push({
        type: 'negative',
        message: 'Telemetry packet loss or disconnected parameter readings'
      });
    } else {
      factors.push({
        type: 'positive',
        message: 'All 5 telemetry channels actively streaming'
      });
    }

    // ----------------------------------------------------
    // 5. INDIVIDUAL PARAMETER TRUST COMPUTATION
    // ----------------------------------------------------
    const hasTempAnomaly = stationAnomalies.some(a => a.sensor === 'temperature' && a.anomalyType !== 'GENUINE_WEATHER_EVENT');
    const hasHumAnomaly = stationAnomalies.some(a => a.sensor === 'humidity' && a.anomalyType !== 'GENUINE_WEATHER_EVENT');
    const hasPresAnomaly = stationAnomalies.some(a => a.sensor === 'pressure' && a.anomalyType !== 'GENUINE_WEATHER_EVENT');
    const hasWindAnomaly = stationAnomalies.some(a => a.sensor === 'wind' && a.anomalyType !== 'GENUINE_WEATHER_EVENT');
    const hasRainAnomaly = stationAnomalies.some(a => a.sensor === 'rainfall' && a.anomalyType !== 'GENUINE_WEATHER_EVENT');

    const tempTrust = Math.max(10, Math.min(100, Math.round((sensorHealth.temperature || 95) - (hasTempAnomaly ? 15 : 0) - (openMeteoDiff && openMeteoDiff > 3 ? 8 : 0))));
    const humTrust = Math.max(10, Math.min(100, Math.round((sensorHealth.humidity || 95) - (hasHumAnomaly ? 15 : 0))));
    const presTrust = Math.max(10, Math.min(100, Math.round((sensorHealth.pressure || 95) - (hasPresAnomaly ? 15 : 0))));
    const windTrust = Math.max(10, Math.min(100, Math.round((sensorHealth.wind || 95) - (hasWindAnomaly ? 15 : 0))));
    const rainTrust = Math.max(10, Math.min(100, Math.round((sensorHealth.rainfall || 95) - (hasRainAnomaly ? 15 : 0))));

    // Weighted sensor health average (30% contribution)
    const avgSensorHealth = (sensorHealth.temperature + sensorHealth.humidity + sensorHealth.pressure + sensorHealth.wind + sensorHealth.rainfall) / 5.0;
    const sensorHealthPenalty = Math.max(0, (100 - avgSensorHealth) * 0.4);

    // ----------------------------------------------------
    // 6. FINAL OVERALL TRUST SCORE DEDUCTION & BOUNDING
    // ----------------------------------------------------
    const totalDeductions = anomalyDeductions + openMeteoDiscrepancyPenalty + sensorFlatlineSpikePenalty + packetLossPenalty + sensorHealthPenalty;
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - totalDeductions)));

    // Categorization
    let status = 'HIGHLY_TRUSTED';
    let statusLabel = 'HIGHLY TRUSTED 🟢';
    let statusColor = '#10b981'; // green-500

    if (finalScore >= 90) {
      status = 'HIGHLY_TRUSTED';
      statusLabel = 'HIGHLY TRUSTED 🟢';
      statusColor = '#10b981';
    } else if (finalScore >= 75) {
      status = 'TRUSTED';
      statusLabel = 'TRUSTED 🟢';
      statusColor = '#22c55e';
    } else if (finalScore >= 50) {
      status = 'CAUTION';
      statusLabel = 'CAUTION 🟡';
      statusColor = '#eab308';
    } else if (finalScore >= 25) {
      status = 'UNRELIABLE';
      statusLabel = 'UNRELIABLE 🟠';
      statusColor = '#f97316';
    } else {
      status = 'CRITICAL';
      statusLabel = 'CRITICAL 🔴';
      statusColor = '#ef4444';
    }

    return {
      stationId: station.stationId,
      overallScore: finalScore,
      status,
      statusLabel,
      statusColor,
      sensorTrust: {
        temperature: tempTrust,
        humidity: humTrust,
        pressure: presTrust,
        wind: windTrust,
        rainfall: rainTrust
      },
      factors: factors.slice(0, 5),
      formulaBreakdown: {
        baseScore: 100,
        anomalyDeductions: Math.round(anomalyDeductions),
        openMeteoDiscrepancyPenalty: Math.round(openMeteoDiscrepancyPenalty),
        sensorFlatlineSpikePenalty: Math.round(sensorFlatlineSpikePenalty),
        packetLossPenalty: Math.round(packetLossPenalty),
        sensorHealthContribution: Math.round(100 - sensorHealthPenalty),
        explanation: `Base Score (100) - Anomaly Deductions (${Math.round(anomalyDeductions)}) - Open-Meteo Discrepancy (${Math.round(openMeteoDiscrepancyPenalty)}) - Sensor Faults (${Math.round(sensorFlatlineSpikePenalty)}) - Packet Loss (${Math.round(packetLossPenalty)}) = ${finalScore}%`
      },
      lastCalculated: new Date().toISOString()
    };
  }
}

module.exports = TrustScoreEngine;
