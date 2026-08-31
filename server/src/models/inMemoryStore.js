/**
 * In-Memory Database Store Fallback for SkyGuard AI
 * Enables 100% runnable standalone operation without requiring local MongoDB daemon
 */
const INITIAL_STATIONS = [
  { stationId: 'AWS-101', name: 'New Delhi IMD Headquarters', location: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090, elevation: 216, status: 'NORMAL', healthScore: 98, lastSeen: new Date() },
  { stationId: 'AWS-102', name: 'Gurugram Cyber City AWS', location: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, elevation: 220, status: 'NORMAL', healthScore: 95, lastSeen: new Date() },
  { stationId: 'AWS-103', name: 'Noida Sector 62 AWS', location: 'Noida, Uttar Pradesh', latitude: 28.6280, longitude: 77.3649, elevation: 200, status: 'NORMAL', healthScore: 94, lastSeen: new Date() },
  { stationId: 'AWS-104', name: 'Faridabad Industrial AWS', location: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178, elevation: 198, status: 'NORMAL', healthScore: 92, lastSeen: new Date() },
  { stationId: 'AWS-201', name: 'Mumbai Colaba Observatory', location: 'Mumbai, Maharashtra', latitude: 18.9067, longitude: 72.8147, elevation: 15, status: 'NORMAL', healthScore: 99, lastSeen: new Date() },
  { stationId: 'AWS-202', name: 'Pune Shivajinagar AWS', location: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, elevation: 560, status: 'NORMAL', healthScore: 96, lastSeen: new Date() },
  { stationId: 'AWS-301', name: 'Bengaluru IMD Center', location: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, elevation: 920, status: 'NORMAL', healthScore: 100, lastSeen: new Date() },
  { stationId: 'AWS-401', name: 'Chennai Nungambakkam AWS', location: 'Chennai, Tamil Nadu', latitude: 13.0604, longitude: 80.2496, elevation: 16, status: 'NORMAL', healthScore: 97, lastSeen: new Date() },
  { stationId: 'AWS-501', name: 'Kolkata Alipore AWS', location: 'Kolkata, West Bengal', latitude: 22.5312, longitude: 88.3364, elevation: 9, status: 'NORMAL', healthScore: 95, lastSeen: new Date() },
  { stationId: 'AWS-601', name: 'Hyderabad Begumpet AWS', location: 'Hyderabad, Telangana', latitude: 17.4435, longitude: 78.4688, elevation: 531, status: 'NORMAL', healthScore: 98, lastSeen: new Date() }
];

class InMemoryStore {
  constructor() {
    this.stations = new Map(INITIAL_STATIONS.map(s => [s.stationId, { ...s }]));
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
    if (this.observations.length > 1000) this.observations.shift();
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
