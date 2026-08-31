import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000
});

export const fetchStations = async () => (await api.get('/stations')).data;
export const fetchStationById = async (id: string) => (await api.get(`/stations/${id}`)).data;
export const fetchStationObservations = async (id: string, limit = 50) => (await api.get(`/stations/${id}/observations?limit=${limit}`)).data;
export const fetchAnomalies = async (params = {}) => (await api.get('/anomalies', { params })).data;
export const fetchAlerts = async () => (await api.get('/alerts')).data;
export const acknowledgeAlert = async (id: string) => (await api.post(`/alerts/${id}/acknowledge`)).data;
export const fetchAnalytics = async () => (await api.get('/analytics')).data;
export const fetchMaintenance = async () => (await api.get('/maintenance')).data;
export const injectFault = async (payload: any) => (await api.post('/simulation/fault', payload)).data;
export const setSimulationSpeed = async (speed: number) => (await api.post('/simulation/speed', { speed })).data;
