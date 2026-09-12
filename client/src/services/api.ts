import axios from 'axios';

const PRODUCTION_BACKEND_URL = 'https://skyguard-aii.onrender.com';

const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return PRODUCTION_BACKEND_URL;
};

const rawBase = getApiBase();
const cleanBase = rawBase.replace(/\/+$/, '');
const baseURL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchStations = async () => (await api.get('/stations')).data;
export const fetchStationById = async (id: string) => (await api.get(`/stations/${id}`)).data;
export const fetchStationObservations = async (id: string, limit = 50) => (await api.get(`/stations/${id}/observations?limit=${limit}`)).data;
export const fetchStationLiveWeather = async (id: string) => (await api.get(`/stations/${id}/live-weather`)).data;
export const fetchStationTrustScore = async (id: string) => (await api.get(`/stations/${id}/trust`)).data;
export const fetchStationOpenMeteoComparison = async (id: string) => (await api.get(`/stations/${id}/openmeteo-comparison`)).data;
export const fetchOpenMeteoForecast = async (latitude = 21.1492, longitude = 79.1613) => 
  (await api.get(`/open-meteo/forecast?latitude=${latitude}&longitude=${longitude}`)).data;

export const fetchAnomalies = async (params = {}) => (await api.get('/anomalies', { params })).data;
export const fetchAlerts = async () => (await api.get('/alerts')).data;
export const acknowledgeAlert = async (id: string) => (await api.post(`/alerts/${id}/acknowledge`)).data;
export const fetchAnalytics = async () => (await api.get('/analytics')).data;
export const fetchMaintenance = async () => (await api.get('/maintenance')).data;
export const runWhatIfSimulation = async (data: { tempChange: number; humChange: number; presChange: number }) => 
  (await api.post('/simulation/what-if', data)).data;
