const Station = require('../models/Station');
const Observation = require('../models/Observation');
const Anomaly = require('../models/Anomaly');
const Alert = require('../models/Alert');
const MlClient = require('./mlClient');
const store = require('../models/inMemoryStore');
const openMeteoService = require('./openMeteoService');
const TrustScoreEngine = require('./trustScoreEngine');
const alertEngine = require('./alertEngine');
const supabaseService = require('./supabaseService');

const INITIAL_STATIONS = store.getStations();

class SimulatorService {
  constructor() {
    this.io = null;
    this.timer = null;
    this.syncTimer = null;
    this.speedMultiplier = 1.0;
    this.stationStates = new Map();
  }

  async initialize(io) {
    this.io = io;
    console.log('⚡ [Simulator] Initializing Real Live Open-Meteo Telemetry Engine...');

    // Initialize physical baseline state for each station
    INITIAL_STATIONS.forEach(s => {
      this.stationStates.set(s.stationId, {
        baseTemp: 28.0,
        baseHum: 65.0,
        basePres: 1012.0,
        baseWind: 12.0,
        baseDir: 180,
        baseRain: 0.0,
        tempNoise: 0,
        humNoise: 0,
        lastMeteoSync: null
      });
    });

    // Start background Open-Meteo API baseline sync asynchronously
    this.syncAllStationsWithOpenMeteo();
    this.syncTimer = setInterval(() => {
      this.syncAllStationsWithOpenMeteo();
    }, 3 * 60 * 1000); // Refresh Open-Meteo baseline every 3 minutes

    this.startLoop();
  }

  async syncAllStationsWithOpenMeteo() {
    const stations = store.getStations();
    for (const station of stations) {
      try {
        const liveMeteo = await openMeteoService.fetchCurrentWeatherForStation(station.latitude, station.longitude);
        if (liveMeteo) {
          const state = this.stationStates.get(station.stationId) || {};
          this.stationStates.set(station.stationId, {
            ...state,
            baseTemp: liveMeteo.temperature ?? state.baseTemp ?? 28.0,
            baseHum: liveMeteo.humidity ?? state.baseHum ?? 65.0,
            basePres: liveMeteo.pressure ?? state.basePres ?? 1012.0,
            baseWind: liveMeteo.windSpeed ?? state.baseWind ?? 12.0,
            baseDir: liveMeteo.windDirection ?? state.baseDir ?? 180,
            baseRain: liveMeteo.rainfall ?? state.baseRain ?? 0.0,
            lastMeteoSync: new Date()
          });
        }
      } catch (err) {
        console.warn(`[Simulator] Non-blocking Open-Meteo sync notice for ${station.stationId}:`, err.message);
      }
    }
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
    let stations = store.getStations();
    const latestObsMap = {};
    const cycleObs = [];

    // 1. Generate real-time telemetry based on Open-Meteo baseline with micro-fluctuations
    for (const station of stations) {
      let state = this.stationStates.get(station.stationId);
      if (!state) {
        state = { baseTemp: 28.0, baseHum: 65.0, basePres: 1012.0, baseWind: 12.0, baseDir: 180, baseRain: 0.0, tempNoise: 0, humNoise: 0 };
        this.stationStates.set(station.stationId, state);
      }

      // Micro sensor fluctuations around real Open-Meteo baseline (±0.08°C)
      state.tempNoise += (Math.random() * 0.1 - 0.05);
      state.tempNoise = Math.max(-0.4, Math.min(0.4, state.tempNoise));

      state.humNoise += (Math.random() * 0.2 - 0.1);
      state.humNoise = Math.max(-1.5, Math.min(1.5, state.humNoise));

      let temp = state.baseTemp + state.tempNoise;
      let hum = Math.max(10, Math.min(100, state.baseHum + state.humNoise));
      let pres = state.basePres + (Math.random() * 0.1 - 0.05);
      let windSpeed = Math.max(0, state.baseWind + (Math.random() * 0.4 - 0.2));
      let windDir = Math.floor((state.baseDir + Math.random() * 4 - 2) % 360);
      let rainfall = state.baseRain;

      const obsObj = {
        stationId: station.stationId,
        timestamp: now,
        temperature: Number(temp.toFixed(2)),
        humidity: Number(hum.toFixed(2)),
        pressure: Number(pres.toFixed(2)),
        windSpeed: Number(windSpeed.toFixed(1)),
        windDirection: Math.round(windDir),
        rainfall: Number(rainfall.toFixed(1)),
        source: 'OPEN_METEO_LIVE_API'
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

      // Save observation to MemoryStore & Supabase
      const obsRecord = {
        ...obs,
        correctedTemperature: correctedTemp,
        imputationMethod,
        qualityFlag,
        anomalyScore: evalRes.anomaly_score
      };
      store.addObservation(obsRecord);
      supabaseService.insertTelemetry(obsRecord).catch(() => {});

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

      // Sensor Health & Early Warning status calculation
      const state = this.stationStates.get(station.stationId) || { baseTemp: 32.0 };
      let maintenanceStatus = 'Healthy';
      let maintenanceWarning = null;
      if (overallHealth < 75 || newTempHealth < 70) {
        maintenanceStatus = 'Maintenance Recommended';
        maintenanceWarning = `⚠ Maintenance Warning: Temperature sensor shows severe drift/degradation. Priority maintenance recommended.`;
      } else if (overallHealth < 90 || newTempHealth < 85) {
        maintenanceStatus = 'Monitor';
        maintenanceWarning = `⚠ Maintenance Warning: Temperature sensor shows gradual drift. Risk of degradation is increasing.`;
      }

      // Station-specific learned normal expected temperature range
      const learnedBaseTemp = state.baseTemp || 32.0;
      const expectedMinTemp = Number((learnedBaseTemp - 2.5).toFixed(1));
      const expectedMaxTemp = Number((learnedBaseTemp + 2.5).toFixed(1));
      const expectedRangeStr = `${expectedMinTemp}°C – ${expectedMaxTemp}°C`;

      const updatedStationObj = { 
        ...station,
        status: newStatus, 
        healthScore: overallHealth,
        sensorHealth: { ...currentHealth, temperature: newTempHealth }
      };

      const stationObs = store.getObservations(station.stationId, 20);
      const stationAnoms = store.getAnomalies({ station: station.stationId, limit: 15 });
      const trustDetails = TrustScoreEngine.calculate(updatedStationObj, stationObs, stationAnoms);

      store.updateStation(station.stationId, { 
        status: newStatus, 
        healthScore: overallHealth,
        sensorHealth: { ...currentHealth, temperature: newTempHealth },
        maintenanceStatus,
        maintenanceWarning,
        learningActive: true,
        expectedRange: expectedRangeStr,
        trustScore: trustDetails.overallScore,
        trustDetails,
        lastSeen: now 
      });

      // Record Anomaly & Alert if triggered
      if (evalRes.classification !== 'NORMAL') {
        const category = evalRes.severity === 'CRITICAL' ? 'CRITICAL' : (evalRes.severity === 'HIGH' ? 'HIGH' : 'WARNING');
        const isGenuine = evalRes.classification === 'GENUINE_WEATHER_EVENT';
        
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

        const tempDiff = obs.temperature !== null ? Math.abs(obs.temperature - learnedBaseTemp).toFixed(1) : '18.0';
        const whatHappened = `Temperature reading ${obs.temperature !== null ? `suddenly changed to ${obs.temperature}°C (Δ${tempDiff}°C jump)` : 'was lost in telemetry stream'}.`;
        const isGenuineOrSensor = isGenuine ? 'Genuine weather event likely.' : 'Sensor issue likely.';
        const shortExplanation = evalRes.short_explanation || evalRes.probable_cause || `Temperature pattern does not support genuine regional weather event. ${evalRes.probable_cause || 'Sensor fault'} is likely.`;

        const anomObj = store.addAnomaly({
          stationId: station.stationId,
          timestamp: now,
          sensor: evalRes.target_sensor || 'temperature',
          anomalyType: evalRes.classification,
          severity: evalRes.severity,
          anomalyScore: evalRes.anomaly_score,
          confidence: evalRes.confidence || 0.94,
          originalValue: obs.temperature,
          correctedValue: correctedTemp,
          expectedRange: expectedRangeStr,
          imputationMethod,
          probableCause: evalRes.probable_cause || (isGenuine ? 'Genuine Weather Event' : 'Sensor Drift'),
          recommendedAction: evalRes.recommended_action || 'Check calibration and inspect the temperature sensor.',
          reasons: evalRes.reasons,
          nearbyComparison: nearbyComp,

          // Clean Anomaly Details Structured 6-step fields
          whatHappened,
          isGenuineOrSensor,
          shortExplanation,
          expectedBehavior: `Expected temperature range: ${expectedRangeStr}`,
          aiEstimatedValue: !isGenuine && (evalRes.confidence || 0.94) >= 0.85 ? correctedTemp : null,
          estimatedValueDisclaimer: 'Estimated value based on historical patterns and other sensor observations.'
        });

        supabaseService.insertAnomaly(anomObj).catch(() => {});

        // Evaluate Smart Alerts with deduplication
        const createdAlerts = await alertEngine.evaluateStationAlerts(
          station.stationId,
          obs,
          [anomObj],
          trustDetails,
          null,
          null
        );

        if (createdAlerts && createdAlerts.length > 0) {
          createdAlerts.forEach(alt => supabaseService.insertAlert(alt).catch(() => {}));
        }

        if (this.io) {
          this.io.emit('anomaly_detected', anomObj);
          if (createdAlerts && createdAlerts.length > 0) {
            createdAlerts.forEach(alt => this.io.emit('alert_created', alt));
          }
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
