/**
 * Node.js Rule-Based Quality Control Engine for AWS Data
 */
class RuleEngine {
  static evaluate(observation, history = []) {
    const { temperature: temp, humidity: hum, pressure: pres } = observation;
    const reasons = [];
    let score = 0.0;
    let anomalyType = 'NORMAL';

    // 1. Missing Data
    if (temp === null || temp === undefined || hum === null || pres === null) {
      return {
        classification: 'MISSING_DATA',
        severity: 'CRITICAL',
        anomalyScore: 1.0,
        confidence: 0.99,
        probableCause: 'Sensor output missing or communication drop',
        recommendedAction: 'Inspect telemetry connection',
        reasons: ['Primary parameters missing in observation packet']
      };
    }

    // 2. Physical Range Check
    if (temp < -50 || temp > 60) {
      score += 0.5;
      reasons.append ? reasons.append(`Temp ${temp}°C out of range`) : reasons.push(`Temp ${temp}°C out of physical range (-50..60°C)`);
    }
    if (hum < 0 || hum > 100) {
      score += 0.5;
      reasons.push(`Humidity ${hum}% out of physical range (0..100%)`);
    }
    if (pres < 800 || pres > 1100) {
      score += 0.5;
      reasons.push(`Pressure ${pres} hPa out of physical range (800..1100 hPa)`);
    }

    // 3. Step Change & Frozen Sensor Checks
    if (history.length >= 3) {
      const lastTemp = history[history.length - 1].temperature;
      const step = Math.abs(temp - lastTemp);
      if (step >= 8.0) {
        score += 0.6;
        reasons.push(`Sudden temperature step change detected: Δ${step.toFixed(1)}°C`);
        anomalyType = 'SENSOR_SPIKE';
      }

      // Flatline frozen check
      const recent4Temps = history.slice(-3).map(h => h.temperature);
      if (recent4Temps.length === 3 && recent4Temps.every(t => Math.abs(t - temp) < 0.001)) {
        score += 0.7;
        reasons.push('Temperature frozen across consecutive cycles');
        anomalyType = 'SENSOR_FROZEN';
      }
    }

    const isAnomaly = score > 0.35;
    return {
      classification: isAnomaly ? (anomalyType !== 'NORMAL' ? anomalyType : 'SENSOR_SPIKE') : 'NORMAL',
      severity: score > 0.6 ? 'CRITICAL' : (score > 0.4 ? 'HIGH' : 'LOW'),
      anomalyScore: Math.min(1.0, score),
      confidence: 0.88,
      probableCause: isAnomaly ? 'Physical boundary/step rule violation' : 'Nominal physical limits',
      recommendedAction: isAnomaly ? 'Perform rule violation inspection' : 'Nominal operation',
      reasons: reasons.length > 0 ? reasons : ['All physical quality rules passed']
    };
  }
}

module.exports = RuleEngine;
