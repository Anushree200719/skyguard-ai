const Station = require('../models/Station');
const Observation = require('../models/Observation');
const Anomaly = require('../models/Anomaly');
const Alert = require('../models/Alert');
const HealthScore = require('../models/HealthScore');
const SimulationEvent = require('../models/SimulationEvent');
const MlClient = require('./mlClient');
const store = require('../models/inMemoryStore');

// Initial 10 Automatic Weather Stations across India
const INITIAL_STATIONS = [
  { stationId: 'AWS-101', name: 'New Delhi IMD Headquarters', location: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  { stationId: 'AWS-102', name: 'Gurugram Cyber City AWS', location: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, elevation: 220 },
  { stationId: 'AWS-103', name: 'Noida Sector 62 AWS', location: 'Noida, Uttar Pradesh', latitude: 28.6280, longitude: 77.3649, elevation: 200 },
  { stationId: 'AWS-104', name: 'Faridabad Industrial AWS', location: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178, elevation: 198 },
  { stationId: 'AWS-201', name: 'Mumbai Colaba Observatory', location: 'Mumbai, Maharashtra', latitude: 18.9067, longitude: 72.8147, elevation: 15 },
  { stationId: 'AWS-202', name: 'Pune Shivajinagar AWS', location: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, elevation: 560 },
  { stationId: 'AWS-301', name: 'Bengaluru IMD Center', location: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, elevation: 920 },
  { stationId: 'AWS-401', name: 'Chennai Nungambakkam AWS', location: 'Chennai, Tamil Nadu', latitude: 13.0604, longitude: 80.2496, elevation: 16 },
  { stationId: 'AWS-501', name: 'Kolkata Alipore AWS', location: 'Kolkata, West Bengal', latitude: 22.5312, longitude: 88.3364, elevation: 9 },
  { stationId: 'AWS-601', name: 'Hyderabad Begumpet AWS', location: 'Hyderabad, Telangana', latitude: 17.4435, longitude: 78.4688, elevation: 531 }
];

class SimulatorService {
  constructor() {
    this.io = null;
    this.timer = null;
    this.speedMultiplier = 1.0;
    this.activeFaults = new Map(); // stationId -> FaultConfig
    this.stationStates = new Map(); // stationId -> { baseTemp, baseHum, basePres, driftOffset }
    this.isSeeded = false;
  }

  async initialize(io) {
    this.io = io;
    console.log('⚡ [Simulator] Initializing Automatic Weather Station Telemetry...');
    
    // Seed stations if DB empty
    try {
      const count = await Station.countDocuments();
      if (count === 0) {
        await Station.insertMany(INITIAL_STATIONS);
        console.log(`  [+] Seeded ${INITIAL_STATIONS.length} AWS stations into MongoDB.`);
      }
    } catch (err) {
      console.warn(`  [!] MongoDB check/seed note: ${err.message}`);
    }

    // Initialize physical baseline state for each station
    INITIAL_STATIONS.forEach(s => {
      this.stationStates.set(s.stationId, {
        baseTemp: 32.0 + (Math.random() * 4 - 2),
        baseHum: 60.0 + (Math.random() * 10 - 5),
        basePres: 1012.0 + (Math.random() * 6 - 3),
        driftOffset: 0.0,
        frozenTemp: null
      });
    });

    this.startLoop();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.2, Math.min(10.0, multiplier));
    this.startLoop();
  }

  injectFault(faultConfig) {
    const { stationId, faultType, durationSeconds = 120 } = faultConfig;
    this.activeFaults.set(stationId, {
      ...faultConfig,
      expiresAt: Date.now() + durationSeconds * 1000
    });
    console.log(`⚡ [Fault Injector] Injected ${faultType} into station ${stationId}`);

    if (this.io) {
      this.io.emit('fault_injected', faultConfig);
    }
  }

  injectMultiStationWeatherEvent(stationIds, temperature = 46.5) {
    stationIds.forEach(id => {
      this.activeFaults.set(id, {
        faultType: 'GENUINE_WEATHER_EVENT',
        targetTemp: temperature,
        expiresAt: Date.now() + 180 * 1000
      });
    });
    console.log(`☀️ [Weather Injector] Injected GENUINE_WEATHER_EVENT across stations: ${stationIds.join(', ')}`);

    if (this.io) {
      this.io.emit('fault_injected', { faultType: 'GENUINE_WEATHER_EVENT', stations: stationIds });
    }
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

    let stations = [];
    try {
      if (mongoose.connection.readyState === 1) {
        stations = await Station.find();
      }
    } catch (e) {}

    if (!stations || stations.length === 0) {
      stations = store.getStations();
    }

    const latestObsMap = {};
    const cycleObs = [];

    // 1. Generate Observations for all stations
    for (const station of stations) {
      let state = this.stationStates.get(station.stationId);
      if (!state) {
        state = { baseTemp: 32.0, baseHum: 60.0, basePres: 1012.0, driftOffset: 0.0, frozenTemp: null };
        this.stationStates.set(station.stationId, state);
      }

      // Diurnal temporal physics (sinusoidal temperature wave)
      let temp = state.baseTemp + 6.0 * Math.sin(2 * Math.PI * timeOfDay - Math.PI / 2) + (Math.random() * 0.4 - 0.2);
      let hum = state.baseHum - 12.0 * Math.sin(2 * Math.PI * timeOfDay - Math.PI / 2) + (Math.random() * 1.0 - 0.5);
      let pres = state.basePres + (Math.random() * 0.2 - 0.1);

      // Check active faults
      const fault = this.activeFaults.get(station.stationId);
      if (fault && Date.now() > fault.expiresAt) {
        this.activeFaults.delete(station.stationId);
      } else if (fault) {
        switch (fault.faultType) {
          case 'SENSOR_SPIKE':
            temp = 58.7; // Instantaneous extreme spike
            break;
          case 'SENSOR_DRIFT':
            state.driftOffset += 0.8;
            temp += state.driftOffset;
            break;
          case 'FROZEN_SENSOR':
            if (state.frozenTemp === null) state.frozenTemp = 31.4;
            temp = state.frozenTemp;
            break;
          case 'RANDOM_NOISE':
            temp += (Math.random() * 16.0 - 8.0);
            hum += (Math.random() * 30.0 - 15.0);
            break;
          case 'MISSING_DATA':
          case 'COMMUNICATION_FAILURE':
            temp = null;
            hum = null;
            pres = null;
            break;
          case 'MULTIVARIATE_INCONSISTENCY':
            temp = 48.0;
            hum = 95.0; // Physically inconsistent
            break;
          case 'GENUINE_WEATHER_EVENT':
            temp = fault.targetTemp || 45.8;
            hum = 18.0;
            pres = 998.5; // Low pressure heat dome
            break;
        }
      }

      const obsObj = {
        stationId: station.stationId,
        timestamp: now,
        temperature: temp !== null ? Number(temp.toFixed(2)) : null,
        humidity: hum !== null ? Number(hum.toFixed(2)) : null,
        pressure: pres !== null ? Number(pres.toFixed(2)) : null
      };

      latestObsMap[station.stationId] = obsObj;
      cycleObs.push({ station, obs: obsObj });
    }

    // 2. Evaluate each observation through ML / Rule Decision Engine
    for (const { station, obs } of cycleObs) {
      if (obs.temperature === null) {
        // Handle communication failure
        try {
          await Station.updateOne({ stationId: station.stationId }, { status: 'CRITICAL' });
        } catch (e) {}
        continue;
      }

      const evalRes = await MlClient.evaluateObservation(station, obs, [], stations, latestObsMap);

      let correctedTemp = null;
      let qualityFlag = 'VALID';

      if (evalRes.classification !== 'NORMAL' && evalRes.classification !== 'GENUINE_WEATHER_EVENT') {
        // Calculate estimated corrected value
        correctedTemp = Number((obs.temperature - (evalRes.anomaly_score * 5.0)).toFixed(2));
        qualityFlag = 'ESTIMATED';
      }

      // Save observation to DB and MemoryStore
      store.addObservation({
        stationId: station.stationId,
        timestamp: now,
        temperature: obs.temperature,
        humidity: obs.humidity,
        pressure: obs.pressure,
        correctedTemperature: correctedTemp,
        qualityFlag,
        anomalyScore: evalRes.anomaly_score
      });

      const updatedHealth = Math.max(0, station.healthScore + (evalRes.health_impact || 0));
      let newStatus = 'NORMAL';
      if (evalRes.classification === 'GENUINE_WEATHER_EVENT') {
        newStatus = 'WEATHER_EVENT';
      } else if (evalRes.severity === 'CRITICAL') {
        newStatus = 'CRITICAL';
      } else if (evalRes.severity === 'HIGH' || evalRes.severity === 'MEDIUM') {
        newStatus = 'WARNING';
      }

      store.updateStation(station.stationId, { status: newStatus, healthScore: updatedHealth, lastSeen: now });

      try {
        const savedObs = new Observation({
          stationId: station.stationId,
          timestamp: now,
          temperature: obs.temperature,
          humidity: obs.humidity,
          pressure: obs.pressure,
          correctedTemperature: correctedTemp,
          qualityFlag,
          anomalyScore: evalRes.anomaly_score
        });
        await savedObs.save();

        await Station.updateOne(
          { stationId: station.stationId }, 
          { status: newStatus, healthScore: updatedHealth, lastSeen: now }
        );
      } catch (e) {}

      // Record Anomaly & Alert if triggered
      if (evalRes.classification !== 'NORMAL') {
        const anomObj = store.addAnomaly({
          stationId: station.stationId,
          timestamp: now,
          parameter: evalRes.classification === 'MULTIVARIATE_INCONSISTENCY' ? 'multivariate' : 'temperature',
          anomalyType: evalRes.classification,
          severity: evalRes.severity,
          anomalyScore: evalRes.anomaly_score,
          confidence: evalRes.confidence,
          probableCause: evalRes.probable_cause,
          recommendedAction: evalRes.recommended_action,
          reasons: evalRes.reasons
        });

        const alertLevel = evalRes.classification === 'GENUINE_WEATHER_EVENT' ? 'WEATHER_EVENT' : evalRes.severity;
        const alertObj = store.addAlert({
          stationId: station.stationId,
          title: `${evalRes.classification.replace(/_/g, ' ')} detected at ${station.name}`,
          message: evalRes.probable_cause,
          level: alertLevel,
          acknowledged: false,
          timestamp: now
        });

        try {
          const anomaly = new Anomaly(anomObj);
          const savedAnomaly = await anomaly.save();
          const alert = new Alert({ ...alertObj, anomalyId: savedAnomaly._id });
          await alert.save();
        } catch (e) {}

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
