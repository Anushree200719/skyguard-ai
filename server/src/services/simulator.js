const Station = require('../models/Station');
const Observation = require('../models/Observation');
const Anomaly = require('../models/Anomaly');
const Alert = require('../models/Alert');
const MlClient = require('./mlClient');
const store = require('../models/inMemoryStore');

const INITIAL_STATIONS = store.getStations();

class SimulatorService {
  constructor() {
    this.io = null;
    this.timer = null;
    this.speedMultiplier = 1.0;
    this.stationStates = new Map();
  }

  async initialize(io) {
    this.io = io;
    console.log('⚡ [Simulator] Initializing 6-Parameter AWS Telemetry Generator...');

    // Initialize physical baseline state for each station
    INITIAL_STATIONS.forEach(s => {
      this.stationStates.set(s.stationId, {
        baseTemp: 32.0 + (Math.random() * 4 - 2),
        baseHum: 65.0 + (Math.random() * 10 - 5),
        basePres: 1012.0 + (Math.random() * 6 - 3),
        baseWind: 14.5 + (Math.random() * 6 - 3),
        baseDir: Math.floor(Math.random() * 360),
        baseRain: Math.max(0, (Math.random() * 2 - 1.5))
      });
    });

    this.startLoop();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.2, Math.min(10.0, multiplier));
    this.startLoop();
  }

  startLoop() {
    if (this.timer) clearInterval(this.timer);
    const intervalMs = Math.round(3000 / this.speedMultiplier);

    this.timer = setInterval(async () => {
      await this.generateCycle();
    }, intervalMs);
  }

  async generateCycle() {
    const now = new Date();
    const timeOfDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;

    let stations = store.getStations();
    const latestObsMap = {};
    const cycleObs = [];

    // 1. Generate 6-parameter realistic weather telemetry
    for (const station of stations) {
      let state = this.stationStates.get(station.stationId);
      if (!state) {
        state = { baseTemp: 32.0, baseHum: 65.0, basePres: 1012.0, baseWind: 14.5, baseDir: 180, baseRain: 0.0 };
        this.stationStates.set(station.stationId, state);
      }

      // Diurnal temporal physics (sinusoidal curves)
      let temp = state.baseTemp + 6.0 * Math.sin(2 * Math.PI * timeOfDay - Math.PI / 2) + (Math.random() * 0.4 - 0.2);
      let hum = state.baseHum - 12.0 * Math.sin(2 * Math.PI * timeOfDay - Math.PI / 2) + (Math.random() * 1.0 - 0.5);
      let pres = state.basePres + (Math.random() * 0.2 - 0.1);
      let windSpeed = Math.max(0, state.baseWind + 4.0 * Math.sin(4 * Math.PI * timeOfDay) + (Math.random() * 2.0 - 1.0));
      let windDir = Math.floor((state.baseDir + Math.sin(timeOfDay) * 15 + Math.random() * 10) % 360);
      let rainfall = Math.max(0, state.baseRain + (Math.random() > 0.85 ? Math.random() * 4.5 : 0.0));

      const obsObj = {
        stationId: station.stationId,
        timestamp: now,
        temperature: Number(temp.toFixed(2)),
        humidity: Number(hum.toFixed(2)),
        pressure: Number(pres.toFixed(2)),
        windSpeed: Number(windSpeed.toFixed(1)),
        windDirection: windDir,
        rainfall: Number(rainfall.toFixed(1))
      };

      latestObsMap[station.stationId] = obsObj;
      cycleObs.push({ station, obs: obsObj });
    }

    // 2. Evaluate observations through ML / Rule Decision Engine
    for (const { station, obs } of cycleObs) {
      const evalRes = await MlClient.evaluateObservation(station, obs, [], stations, latestObsMap);

      let correctedTemp = obs.temperature;
      let imputationMethod = 'Direct Telemetry Reading';
      let qualityFlag = 'VALID';

      if (evalRes.classification !== 'NORMAL' && evalRes.classification !== 'GENUINE_WEATHER_EVENT') {
        correctedTemp = Number((obs.temperature - (evalRes.anomaly_score * 4.5)).toFixed(2));
        imputationMethod = 'Time-Series Imputation + Nearby Station Comparison';
        qualityFlag = 'ESTIMATED';
      }

      // Save observation to MemoryStore
      store.addObservation({
        ...obs,
        correctedTemperature: correctedTemp,
        imputationMethod,
        qualityFlag,
        anomalyScore: evalRes.anomaly_score
      });

      // Update per-sensor health metrics
      const currentHealth = station.sensorHealth || { temperature: 95, humidity: 95, pressure: 95, wind: 95, rainfall: 95 };
      let newTempHealth = currentHealth.temperature;
      let newStatus = station.status;

      if (evalRes.classification === 'GENUINE_WEATHER_EVENT') {
        newStatus = 'WEATHER_EVENT';
      } else if (evalRes.classification !== 'NORMAL') {
        newTempHealth = Math.max(10, currentHealth.temperature - 6);
        newStatus = evalRes.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
      }

      const overallHealth = Math.round(
        (newTempHealth + currentHealth.humidity + currentHealth.pressure + currentHealth.wind + currentHealth.rainfall) / 5
      );

      store.updateStation(station.stationId, { 
        status: newStatus, 
        healthScore: overallHealth,
        sensorHealth: { ...currentHealth, temperature: newTempHealth },
        lastSeen: now 
      });

      // Record Anomaly & Alert if triggered
      if (evalRes.classification !== 'NORMAL') {
        const category = evalRes.severity === 'CRITICAL' ? 'CRITICAL' : (evalRes.severity === 'HIGH' ? 'HIGH' : 'WARNING');
        
        const nearbyComp = stations
          .filter(s => s.stationId !== station.stationId)
          .slice(0, 3)
          .map(s => {
            const nobs = latestObsMap[s.stationId] || {};
            return {
              stationId: s.stationId,
              name: s.name,
              distanceKm: 24.5,
              temperature: nobs.temperature || 34.0,
              humidity: nobs.humidity || 65.0,
              pressure: nobs.pressure || 1012.0
            };
          });

        const anomObj = store.addAnomaly({
          stationId: station.stationId,
          timestamp: now,
          sensor: evalRes.target_sensor || 'temperature',
          anomalyType: evalRes.classification,
          severity: evalRes.severity,
          anomalyScore: evalRes.anomaly_score,
          confidence: evalRes.confidence,
          originalValue: obs.temperature,
          correctedValue: correctedTemp,
          expectedRange: '30.0°C – 38.0°C',
          imputationMethod,
          probableCause: evalRes.probable_cause,
          recommendedAction: evalRes.recommended_action,
          reasons: evalRes.reasons,
          nearbyComparison: nearbyComp
        });

        const alertObj = store.addAlert({
          stationId: station.stationId,
          title: `${evalRes.classification.replace(/_/g, ' ')} AT ${station.stationId}`,
          message: evalRes.probable_cause,
          level: evalRes.severity,
          category,
          acknowledged: false,
          timestamp: now,
          aiExplanation: evalRes.reasons?.join('. ')
        });

        if (this.io) {
          this.io.emit('anomaly_detected', anomObj);
          this.io.emit('alert_created', alertObj);
        }
      }
    }

    // Broadcast Socket.IO weather_update
    if (this.io) {
      this.io.emit('weather_update', {
        timestamp: now,
        observations: Object.values(latestObsMap)
      });
    }
  }
}

const simulator = new SimulatorService();
module.exports = simulator;
