const axios = require('axios');
const RuleEngine = require('./ruleEngine');
const SpatialConsensusEngine = require('./spatialConsensus');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

class MlClient {
  static async evaluateObservation(station, currentObs, history = [], allStations = [], latestObsMap = {}) {
    // 1. Prepare payload for FastAPI ML Service
    const nearbyObs = allStations
      .filter(s => s.stationId !== station.stationId)
      .map(s => latestObsMap[s.stationId])
      .filter(Boolean);

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/anomaly`, {
        station_id: station.stationId,
        current_observation: {
          temperature: currentObs.temperature,
          humidity: currentObs.humidity,
          pressure: currentObs.pressure
        },
        history: history.map(h => ({
          temperature: h.temperature,
          humidity: h.humidity,
          pressure: h.pressure
        })),
        nearby_stations_observations: nearbyObs.map(n => ({
          temperature: n.temperature,
          humidity: n.humidity,
          pressure: n.pressure
        }))
      }, { timeout: 3500 });

      return {
        ...response.data,
        mlServiceOffline: false
      };
    } catch (error) {
      if (!MlClient.offlineLogged) {
        console.log(`ℹ️ [MlClient] ML Service offline (${error.message}). Sourcing Fallback Node.js Rule & Spatial Consensus Engine.`);
        MlClient.offlineLogged = true;
      }
      
      // Fallback: Use local Rule Engine & Spatial Consensus
      const ruleRes = RuleEngine.evaluate(currentObs, history);
      const spatialRes = SpatialConsensusEngine.evaluateSpatialConsensus(station, currentObs, allStations, latestObsMap);

      if (spatialRes.isGenuineEvent && currentObs.temperature > 40.0) {
        return {
          classification: 'GENUINE_WEATHER_EVENT',
          severity: 'HIGH',
          anomaly_score: 0.75,
          confidence: 0.94,
          probable_cause: 'Genuine Weather Event',
          short_explanation: `Temperature increased to ${currentObs.temperature}°C across multiple nearby stations. Regional extreme weather event confirmed by spatial consensus.`,
          recommended_action: 'Issue meteorological warning',
          reasons: [
            'Spatial Consensus Engine: Multiple nearby stations confirm elevated temperature',
            `Confirmed by ${(spatialRes.matchingRatio * 100).toFixed(0)}% of surrounding stations`
          ],
          health_impact: 0,
          mlServiceOffline: true
        };
      }

      return {
        classification: ruleRes.classification,
        severity: ruleRes.severity,
        anomaly_score: ruleRes.anomalyScore,
        confidence: ruleRes.confidence,
        probable_cause: ruleRes.probableCause,
        short_explanation: ruleRes.shortExplanation,
        recommended_action: ruleRes.recommendedAction,
        reasons: [...ruleRes.reasons, 'Evaluated via Fallback Rule Engine (ML SERVICE OFFLINE)'],
        health_impact: ruleRes.classification === 'NORMAL' ? 0 : -10,
        mlServiceOffline: true
      };
    }
  }
}

module.exports = MlClient;
