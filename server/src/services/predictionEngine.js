class PredictionEngine {
  /**
   * Calculates weather predictions for 1h, 6h, and 24h horizons.
   * Uses Hybrid Calibration: Open-Meteo NWP Satellite baseline + AWS Station Local Microclimate Bias + Short-term Telemetry Momentum.
   */
  generatePrediction(station, obsList = [], openMeteoData = null) {
    const latestObs = obsList && obsList.length > 0 ? obsList[obsList.length - 1] : null;
    const oldestObs = obsList && obsList.length > 5 ? obsList[0] : latestObs;

    const currentTemp = latestObs?.temperature ?? 28.0;
    const currentHum = latestObs?.humidity ?? 65.0;
    const currentWind = latestObs?.windSpeed ?? 12.0;
    const currentWindDir = latestObs?.windDirection ?? 180;
    const currentPres = latestObs?.pressure ?? 1013.25;
    const currentRain = latestObs?.rainfall ?? 0.0;

    // Calculate recent station 30-min momentum (slope)
    const obsSpanCount = obsList.length > 1 ? obsList.length : 1;
    const tempSlope = oldestObs ? (currentTemp - oldestObs.temperature) / obsSpanCount : 0.0;
    const humSlope = oldestObs ? (currentHum - oldestObs.humidity) / obsSpanCount : 0.0;
    const windSlope = oldestObs ? (currentWind - oldestObs.windSpeed) / obsSpanCount : 0.0;

    // Open-Meteo forecast vectors
    let omCurrent = null;
    let omHourly = null;
    if (openMeteoData && openMeteoData.hourly) {
      omHourly = openMeteoData.hourly;
      omCurrent = openMeteoData.current;
    }

    const omCurrentTemp = omCurrent?.temperature_2m ?? omHourly?.temperature_2m?.[0] ?? currentTemp;
    const omCurrentHum = omCurrent?.relative_humidity_2m ?? omHourly?.relative_humidity_2m?.[0] ?? currentHum;
    const omCurrentWind = omCurrent?.wind_speed_10m ?? omHourly?.wind_speed_10m?.[0] ?? currentWind;

    // Station micro-climate bias against Open-Meteo satellite reading
    const tempBias = currentTemp - omCurrentTemp;
    const humBias = currentHum - omCurrentHum;
    const windBias = currentWind - omCurrentWind;

    // Station base trust/health score influence
    const stationTrust = station?.trustScore ?? 85;
    const stationHealth = station?.healthScore ?? 90;
    const baseReliability = Math.min(98, Math.max(50, Math.round(stationTrust * 0.55 + stationHealth * 0.45)));

    // Helper to calculate calibrated target for a future hour step (h = 1, 6, 24)
    const calculateTargetAtHour = (h) => {
      let targetTemp = currentTemp;
      let targetHum = currentHum;
      let targetWind = currentWind;
      let rainProb = 15; // default baseline

      if (omHourly && omHourly.time && omHourly.time.length > h) {
        const omTempAtH = omHourly.temperature_2m?.[h] ?? currentTemp;
        const omHumAtH = omHourly.relative_humidity_2m?.[h] ?? currentHum;
        const omWindAtH = omHourly.wind_speed_10m?.[h] ?? currentWind;
        const omRainProbAtH = omHourly.precipitation_probability?.[h] ?? (omHourly.precipitation?.[h] > 0 ? 80 : 20);

        // Exponential decay of local bias towards satellite physics (half-life = 8 hours)
        const biasDecay = Math.exp(-h / 8.0);
        // Short term momentum decay (half-life = 2 hours)
        const momentumDecay = Math.exp(-h / 2.0);

        targetTemp = omTempAtH + (tempBias * biasDecay) + (tempSlope * 3.0 * momentumDecay);
        targetHum = omHumAtH + (humBias * biasDecay) + (humSlope * 3.0 * momentumDecay);
        targetWind = omWindAtH + (windBias * biasDecay) + (windSlope * 3.0 * momentumDecay);
        rainProb = Math.min(100, Math.max(0, Math.round(omRainProbAtH)));
      } else {
        // Statistical trend fallback when Open-Meteo hourly vectors unavailable
        targetTemp = currentTemp + (tempSlope * h * 0.4);
        targetHum = currentHum + (humSlope * h * 0.4);
        targetWind = currentWind + (windSlope * h * 0.3);
        rainProb = targetHum > 80 ? 65 : (targetHum > 70 ? 40 : 15);
      }

      // Bound realistic physical limits
      targetTemp = Math.round(targetTemp * 10) / 10;
      targetHum = Math.min(100, Math.max(10, Math.round(targetHum)));
      targetWind = Math.min(120, Math.max(0, Math.round(targetWind * 10) / 10));

      const tempDeltaVal = Math.round((targetTemp - currentTemp) * 10) / 10;
      const humDeltaVal = Math.round(targetHum - currentHum);
      const windDeltaVal = Math.round((targetWind - currentWind) * 10) / 10;

      // Wind condition text description
      let windTrendText = 'Stable';
      if (windDeltaVal > 3.0) windTrendText = 'Increasing ↑';
      else if (windDeltaVal < -3.0) windTrendText = 'Decreasing ↓';
      else if (targetWind > 25.0) windTrendText = 'Strong Gusts 🌬';
      else if (targetWind < 5.0) windTrendText = 'Calm Breeze 🍃';

      // Confidence computation
      const horizonPenalty = h === 1 ? 3 : (h === 6 ? 9 : 18);
      const confidence = Math.max(45, Math.min(96, baseReliability - horizonPenalty));

      return {
        horizon: `${h}h`,
        timeframeLabel: h === 1 ? 'Next 1 Hour' : (h === 6 ? 'Next 6 Hours' : 'Next 24 Hours'),
        confidence,
        confidenceLevel: confidence >= 85 ? 'HIGH' : (confidence >= 70 ? 'MEDIUM' : 'MODERATE'),
        temperature: {
          current: currentTemp,
          predicted: targetTemp,
          delta: tempDeltaVal,
          formattedDelta: `${tempDeltaVal >= 0 ? '↑ +' : '↓ '}${tempDeltaVal.toFixed(1)}°C`,
          unit: '°C'
        },
        humidity: {
          current: currentHum,
          predicted: targetHum,
          delta: humDeltaVal,
          formattedDelta: `${humDeltaVal >= 0 ? '↑ +' : '↓ '}${Math.abs(humDeltaVal)}%`,
          unit: '%'
        },
        wind: {
          current: currentWind,
          predicted: targetWind,
          delta: windDeltaVal,
          trend: windTrendText,
          unit: 'km/h'
        },
        rainProbability: {
          percentage: rainProb,
          riskCategory: rainProb >= 70 ? 'HIGH' : (rainProb >= 40 ? 'MODERATE' : 'LOW')
        },
        keyFactors: [
          `Open-Meteo baseline forecast adjusted by AWS local bias (${tempBias >= 0 ? '+' : ''}${tempBias.toFixed(1)}°C)`,
          `30-min station momentum: Temp trend ${tempSlope >= 0 ? '+' : ''}${tempSlope.toFixed(2)}°C/obs`,
          `Station reliability factor: ${baseReliability}%`
        ]
      };
    };

    // Calculate predictions for 1h, 6h, 24h
    const outlook1h = calculateTargetAtHour(1);
    const outlook6h = calculateTargetAtHour(6);
    const outlook24h = calculateTargetAtHour(24);

    // Generate 24-hour hourly trajectory for visual chart
    const hourlyTrajectory = [];
    for (let h = 1; h <= 24; h++) {
      const point = calculateTargetAtHour(h);
      let timeLabel = `+${h}h`;
      if (omHourly && omHourly.time && omHourly.time[h]) {
        const dateObj = new Date(omHourly.time[h]);
        timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      hourlyTrajectory.push({
        hour: h,
        timeLabel,
        temperature: point.temperature.predicted,
        humidity: point.humidity.predicted,
        windSpeed: point.wind.predicted,
        rainProbability: point.rainProbability.percentage,
        confidence: point.confidence
      });
    }

    return {
      stationId: station.stationId,
      stationName: station.name,
      stationLocation: station.location,
      generatedAt: new Date().toISOString(),
      currentTelemetry: {
        temperature: currentTemp,
        humidity: currentHum,
        pressure: currentPres,
        windSpeed: currentWind,
        windDirection: currentWindDir,
        rainfall: currentRain
      },
      outlooks: {
        h1: outlook1h,
        h6: outlook6h,
        h24: outlook24h
      },
      hourlyTrajectory,
      transparency: {
        methodology: 'Hybrid Calibration (Open-Meteo NWP Baseline + AWS Micro-climate Bias + Station Momentum)',
        dataSources: [
          'AWS Station Real-time Telemetry (Recent 30-min momentum & local micro-climate offset)',
          'Open-Meteo High-Resolution Satellite Numerical Weather Prediction (NWP)'
        ],
        isMLModel: false,
        mlUsageNote: 'Weather forecasting uses statistical satellite hybrid calibration. PyTorch ML service is dedicated to real-time spatial anomaly classification.',
        overallConfidence: Math.round((outlook1h.confidence + outlook6h.confidence + outlook24h.confidence) / 3),
        limitations: [
          'Accuracy naturally decreases over extended 24-hour prediction horizons.',
          'Local rapid thunderstorm formation relies on satellite radar coverage updates.',
          'Assumes AWS station sensors maintain normal operating status.'
        ]
      }
    };
  }
}

module.exports = new PredictionEngine();
