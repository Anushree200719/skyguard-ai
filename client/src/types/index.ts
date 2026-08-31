export type StationStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'WEATHER_EVENT' | 'UNDER_ANALYSIS';

export interface Station {
  _id?: string;
  stationId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  elevation: number;
  status: StationStatus;
  healthScore: number;
  sensorHealth: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind: number;
    rainfall: number;
  };
  rulDays: number;
  lastSeen: string;
}

export interface Observation {
  _id?: string;
  stationId: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  rainfall: number | null;

  // Imputation / Correction fields
  correctedTemperature?: number | null;
  correctedHumidity?: number | null;
  correctedPressure?: number | null;
  correctedWindSpeed?: number | null;
  correctedRainfall?: number | null;

  imputationMethod?: string;
  qualityFlag?: 'VALID' | 'ESTIMATED' | 'SUSPECT' | 'INVALID';
  anomalyScore?: number;
}

export interface NearbyComparison {
  stationId: string;
  name: string;
  distanceKm: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

export interface Anomaly {
  _id: string;
  stationId: string;
  timestamp: string;
  sensor: 'temperature' | 'humidity' | 'pressure' | 'wind' | 'rainfall' | 'multivariate';
  anomalyType: 
    | 'NORMAL'
    | 'GENUINE_WEATHER_EVENT'
    | 'POSSIBLE_SENSOR_FAULT'
    | 'UNCERTAIN_EVENT'
    | 'SENSOR_SPIKE'
    | 'SENSOR_DRIFT'
    | 'SENSOR_FROZEN'
    | 'SENSOR_NOISE'
    | 'MISSING_DATA'
    | 'MULTIVARIATE_INCONSISTENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomalyScore: number;
  confidence: number;
  originalValue: number;
  correctedValue: number;
  expectedRange: string;
  imputationMethod: string;
  probableCause: string;
  recommendedAction: string;
  reasons: string[];
  nearbyComparison?: NearbyComparison[];
}

export interface Alert {
  _id: string;
  stationId: string;
  title: string;
  message: string;
  level: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO' | 'WEATHER_EVENT';
  category: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  acknowledged: boolean;
  timestamp: string;
  aiExplanation?: string;
}

export interface AnalyticsSummary {
  totalStations: number;
  activeStations: number;
  normalStations: number;
  underAnalysisCount: number;
  totalAnomalies: number;
  sensorFaults: number;
  genuineWeatherEvents: number;
  criticalAlertsCount: number;
  overallQualityScore: number;
}

export interface MaintenanceItem {
  priority: 'PRIORITY 1' | 'PRIORITY 2' | 'PRIORITY 3';
  stationId: string;
  stationName: string;
  location: string;
  healthScore: number;
  sensorHealth: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind: number;
    rainfall: number;
  };
  rulDays: number;
  status: StationStatus;
  issue: string;
  recommendedAction: string;
  severity: string;
  inspectionMarked?: boolean;
}
