import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 12000
});

export const fetchStations = async () => (await api.get('/stations')).data;
export const fetchStationById = async (id: string) => (await api.get(`/stations/${id}`)).data;
export const fetchStationObservations = async (id: string, limit = 50) => (await api.get(`/stations/${id}/observations?limit=${limit}`)).data;
export const fetchStationLiveWeather = async (id: string) => (await api.get(`/stations/${id}/live-weather`)).data;
export const fetchOpenMeteoForecast = async (latitude = 21.1492, longitude = 79.1613) => 
  (await api.get(`/open-meteo/forecast?latitude=${latitude}&longitude=${longitude}`)).data;

export const fetchAnomalies = async (params = {}) => (await api.get('/anomalies', { params })).data;
export const fetchAlerts = async () => (await api.get('/alerts')).data;
export const acknowledgeAlert = async (id: string) => (await api.post(`/alerts/${id}/acknowledge`)).data;
export const fetchAnalytics = async () => (await api.get('/analytics')).data;
export const fetchMaintenance = async () => (await api.get('/maintenance')).data;
export const runWhatIfSimulation = async (data: { tempChange: number; humChange: number; presChange: number }) => 
  (await api.post('/simulation/what-if', data)).data;

