/**
 * Rule-Based Quality Control Engine for AWS 6-Parameter Data
 */
class RuleEngine {
  static evaluate(observation, history = []) {
    const { 
      temperature: temp, 
      humidity: hum, 
      pressure: pres,
      windSpeed: wind,
      rainfall: rain
    } = observation;

    const reasons = [];
    let score = 0.0;
    let anomalyType = 'NORMAL';
    let targetSensor = 'temperature';

    // 1. Missing Data Check
    if (temp === null || hum === null || pres === null) {
      return {
        classification: 'MISSING_DATA',
        severity: 'CRITICAL',
        anomalyScore: 1.0,
        confidence: 0.99,
        targetSensor: temp === null ? 'temperature' : (hum === null ? 'humidity' : 'pressure'),
        probableCause: 'Sensor output missing or telemetry packet loss',
        recommendedAction: 'Check AWS telemetry receiver and hardware wiring',
        reasons: ['Primary parameters missing in observation payload']
      };
    }

    // 2. Physical Range Validation
    if (temp < -50 || temp > 60) {
      score += 0.5;
      targetSensor = 'temperature';
      reasons.push(`Temperature ${temp}°C out of physical range (-50°C to 60°C)`);
    }
    if (hum < 0 || hum > 100) {
      score += 0.5;
      targetSensor = 'humidity';
      reasons.push(`Humidity ${hum}% out of physical range (0% to 100%)`);
    }
    if (pres < 800 || pres > 1100) {
      score += 0.5;
      targetSensor = 'pressure';
      reasons.push(`Atmospheric pressure ${pres} hPa out of physical range (800..1100 hPa)`);
    }
    if (wind !== null && (wind < 0 || wind > 120)) {
      score += 0.5;
      targetSensor = 'wind';
      reasons.push(`Wind speed ${wind} m/s out of physical range (0..120 m/s)`);
    }
    if (rain !== null && rain < 0) {
      score += 0.5;
      targetSensor = 'rainfall';
      reasons.push(`Negative rainfall value ${rain} mm detected`);
    }

    // 3. Step Change & Frozen Sensor Checks
    if (history.length >= 3) {
      const lastTemp = history[history.length - 1].temperature;
      if (lastTemp !== null) {
        const step = Math.abs(temp - lastTemp);
        if (step >= 8.0) {
          score += 0.6;
          targetSensor = 'temperature';
          reasons.push(`Sudden temperature step jump detected: Δ${step.toFixed(1)}°C`);
          anomalyType = 'SENSOR_SPIKE';
        }
      }

      // Flatline frozen check
      const recent4Temps = history.slice(-3).map(h => h.temperature).filter(t => t !== null);
      if (recent4Temps.length === 3 && recent4Temps.every(t => Math.abs(t - temp) < 0.001)) {
        score += 0.7;
        targetSensor = 'temperature';
        reasons.push('Temperature value frozen across 4 consecutive reading cycles');
        anomalyType = 'SENSOR_FROZEN';
      }
    }

    const isAnomaly = score > 0.35;
    return {
      classification: isAnomaly ? (anomalyType !== 'NORMAL' ? anomalyType : 'POSSIBLE_SENSOR_FAULT') : 'NORMAL',
      severity: score > 0.6 ? 'CRITICAL' : (score > 0.4 ? 'HIGH' : 'LOW'),
      anomalyScore: Math.min(1.0, score),
      confidence: 0.94,
      targetSensor,
      probableCause: isAnomaly ? 'Physical range/step boundary rule violation' : 'Nominal physical limits',
      recommendedAction: isAnomaly ? 'Perform sensor diagnostic check' : 'Nominal operation',
      reasons: reasons.length > 0 ? reasons : ['All 6 physical quality control rules passed']
    };
  }
}

module.exports = RuleEngine;
