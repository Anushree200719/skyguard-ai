export type StationStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'WEATHER_EVENT';

export interface Station {
  _id: string;
  stationId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  elevation: number;
  status: StationStatus;
  healthScore: number;
  lastSeen: string;
}

export interface Observation {
  _id?: string;
  stationId: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  correctedTemperature?: number | null;
  qualityFlag?: 'VALID' | 'ESTIMATED' | 'SUSPECT' | 'INVALID';
  anomalyScore?: number;
}

export interface Anomaly {
  _id: string;
  stationId: string;
  timestamp: string;
  parameter: 'temperature' | 'humidity' | 'pressure' | 'multivariate' | 'all';
  anomalyType: 
    | 'NORMAL'
    | 'GENUINE_WEATHER_EVENT'
    | 'SENSOR_SPIKE'
    | 'SENSOR_DRIFT'
    | 'SENSOR_FROZEN'
    | 'SENSOR_NOISE'
    | 'MISSING_DATA'
    | 'COMMUNICATION_FAILURE'
    | 'MULTIVARIATE_INCONSISTENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomalyScore: number;
  confidence: number;
  probableCause: string;
  recommendedAction: string;
  reasons: string[];
}

export interface Alert {
  _id: string;
  stationId: string;
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'WEATHER_EVENT';
  acknowledged: boolean;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalStations: number;
  onlineStations: number;
  warningStations: number;
  criticalStations: number;
  weatherEventsCount: number;
  overallQualityScore: number;
  totalAnomalies: number;
  genuineWeatherEvents: number;
  sensorFaults: number;
  communicationFailures: number;
}

export interface MaintenanceItem {
  priority: 'PRIORITY 1' | 'PRIORITY 2' | 'PRIORITY 3';
  stationId: string;
  stationName: string;
  healthScore: number;
  status: StationStatus;
  issue: string;
  recommendedAction: string;
  severity: string;
}
