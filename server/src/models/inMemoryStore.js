/**
 * Standalone In-Memory Database Store for SkyGuard AI
 * Supports 6-parameter telemetry, per-sensor health breakdowns, and RUL estimation
 */
const INITIAL_STATIONS = [
  { 
    stationId: 'AWS-101', name: 'New Delhi IMD Headquarters', location: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090, elevation: 216, status: 'NORMAL', healthScore: 98,
    sensorHealth: { temperature: 98, humidity: 96, pressure: 99, wind: 95, rainfall: 97 }, rulDays: 420, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-102', name: 'Gurugram Cyber City AWS', location: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, elevation: 220, status: 'NORMAL', healthScore: 95,
    sensorHealth: { temperature: 94, humidity: 95, pressure: 98, wind: 92, rainfall: 96 }, rulDays: 380, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-103', name: 'Noida Sector 62 AWS', location: 'Noida, Uttar Pradesh', latitude: 28.6280, longitude: 77.3649, elevation: 200, status: 'NORMAL', healthScore: 94,
    sensorHealth: { temperature: 92, humidity: 96, pressure: 97, wind: 90, rainfall: 95 }, rulDays: 350, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-104', name: 'Faridabad Industrial AWS', location: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178, elevation: 198, status: 'NORMAL', healthScore: 92,
    sensorHealth: { temperature: 90, humidity: 93, pressure: 96, wind: 88, rainfall: 94 }, rulDays: 310, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-201', name: 'Mumbai Colaba Observatory', location: 'Mumbai, Maharashtra', latitude: 18.9067, longitude: 72.8147, elevation: 15, status: 'NORMAL', healthScore: 99,
    sensorHealth: { temperature: 99, humidity: 98, pressure: 99, wind: 97, rainfall: 99 }, rulDays: 490, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-202', name: 'Pune Shivajinagar AWS', location: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, elevation: 560, status: 'NORMAL', healthScore: 96,
    sensorHealth: { temperature: 95, humidity: 97, pressure: 98, wind: 94, rainfall: 96 }, rulDays: 410, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-301', name: 'Bengaluru IMD Center', location: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, elevation: 920, status: 'NORMAL', healthScore: 100,
    sensorHealth: { temperature: 100, humidity: 100, pressure: 100, wind: 99, rainfall: 100 }, rulDays: 520, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-401', name: 'Chennai Nungambakkam AWS', location: 'Chennai, Tamil Nadu', latitude: 13.0604, longitude: 80.2496, elevation: 16, status: 'NORMAL', healthScore: 97,
    sensorHealth: { temperature: 96, humidity: 98, pressure: 97, wind: 95, rainfall: 97 }, rulDays: 430, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-501', name: 'Kolkata Alipore AWS', location: 'Kolkata, West Bengal', latitude: 22.5312, longitude: 88.3364, elevation: 9, status: 'NORMAL', healthScore: 95,
    sensorHealth: { temperature: 93, humidity: 96, pressure: 97, wind: 92, rainfall: 95 }, rulDays: 370, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-601', name: 'Hyderabad Begumpet AWS', location: 'Hyderabad, Telangana', latitude: 17.4435, longitude: 78.4688, elevation: 531, status: 'NORMAL', healthScore: 98,
    sensorHealth: { temperature: 97, humidity: 98, pressure: 99, wind: 96, rainfall: 98 }, rulDays: 460, lastSeen: new Date()
  },
  { 
    stationId: 'AWS-701', name: 'Nagpur Central Meteorology Station', location: 'Nagpur, Maharashtra', latitude: 21.1492, longitude: 79.1613, elevation: 310, status: 'NORMAL', healthScore: 99,
    sensorHealth: { temperature: 99, humidity: 98, pressure: 99, wind: 98, rainfall: 99 }, rulDays: 480, lastSeen: new Date()
  }
];

class InMemoryStore {
  constructor() {
    this.stations = new Map(INITIAL_STATIONS.map(s => [s.stationId, { ...s, trustScore: 95 }]));
    this.observations = [];
    this.anomalies = [];
    this.alerts = [];
  }

  getStations() {
    return Array.from(this.stations.values());
  }

  getStation(id) {
    return this.stations.get(id) || null;
  }

  updateStation(id, update) {
    const st = this.stations.get(id);
    if (st) {
      Object.assign(st, update);
    }
  }

  addObservation(obs) {
    this.observations.push({ _id: `obs_${Date.now()}_${Math.random()}`, ...obs });
    if (this.observations.length > 1500) this.observations.shift();
  }

  getObservations(stationId, limit = 50) {
    return this.observations
      .filter(o => o.stationId === stationId)
      .slice(-limit);
  }

  addAnomaly(anom) {
    const obj = { _id: `anom_${Date.now()}_${Math.random()}`, ...anom };
    this.anomalies.push(obj);
    if (this.anomalies.length > 500) this.anomalies.shift();
    return obj;
  }

  getAnomalies(query = {}) {
    let result = [...this.anomalies];
    if (query.station) result = result.filter(a => a.stationId === query.station);
    if (query.type) result = result.filter(a => a.anomalyType === query.type);
    if (query.severity) result = result.filter(a => a.severity === query.severity);
    return result.reverse().slice(0, query.limit || 100);
  }

  addAlert(alert) {
    const obj = { _id: `alt_${Date.now()}_${Math.random()}`, ...alert };
    this.alerts.push(obj);
    if (this.alerts.length > 200) this.alerts.shift();
    return obj;
  }

  getAlerts(query = {}) {
    let result = [...this.alerts];
    if (query.category) result = result.filter(a => a.category === query.category);
    if (query.acknowledged !== undefined) {
      result = result.filter(a => a.acknowledged === (query.acknowledged === 'true'));
    }
    return result.reverse().slice(0, query.limit || 50);
  }

  acknowledgeAlert(id) {
    const alt = this.alerts.find(a => a._id === id);
    if (alt) alt.acknowledged = true;
    return alt;
  }
}

const store = new InMemoryStore();
module.exports = store;
