export type StationStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'WEATHER_EVENT' | 'UNDER_ANALYSIS';
export type TrustStatusCategory = 'HIGHLY_TRUSTED' | 'TRUSTED' | 'CAUTION' | 'UNRELIABLE' | 'CRITICAL';
export type ComparisonStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';
export type OverallAgreementTier = 'EXCELLENT' | 'MODERATE' | 'POOR';
export type SensorHealthLevel = 'HEALTHY' | 'WARNING' | 'UNSTABLE' | 'CRITICAL' | 'OFFLINE';

export interface IndividualSensorHealth {
  id: 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'rainfall';
  name: string;
  type: string;
  unit: string;
  healthPercentage: number;
  status: SensorHealthLevel;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  lastReading: string;
  lastUpdate: string;
  issues: string[];
}

export interface StationSensorHealthResult {
  stationId: string;
  stationName: string;
  overallHealthScore: number;
  sensors: IndividualSensorHealth[];
  timestamp: string;
}

export interface ParameterComparison {
  id: 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'rainfall';
  name: string;
  unit: string;
  awsValue: number | null;
  openMeteoValue: number | null;
  difference: number | null;
  agreementPercentage: number | null;
  status: ComparisonStatus;
  statusLabel: string;
  statusColor: string;
  thresholdText: string;
}

export interface OpenMeteoComparisonResult {
  stationId: string;
  stationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  overallAgreement: number;
  overallStatus: OverallAgreementTier;
  overallStatusLabel: string;
  overallStatusColor: string;
  parameters: ParameterComparison[];
  timestamp: string;
}

export interface SensorTrustBreakdown {
  temperature: number;
  humidity: number;
  pressure: number;
  wind: number;
  rainfall: number;
}

export interface TrustFactor {
  type: 'positive' | 'warning' | 'negative';
  message: string;
}

export interface TrustScoreDetails {
  stationId: string;
  overallScore: number;
  status: TrustStatusCategory;
  statusLabel: string;
  statusColor: string;
  sensorTrust: SensorTrustBreakdown;
  factors: TrustFactor[];
  formulaBreakdown: {
    baseScore: number;
    anomalyDeductions: number;
    openMeteoDiscrepancyPenalty: number;
    sensorFlatlineSpikePenalty: number;
    packetLossPenalty: number;
    sensorHealthContribution: number;
    explanation: string;
  };
  lastCalculated: string;
}

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

  // Enhancements
  maintenanceStatus?: 'Healthy' | 'Monitor' | 'Maintenance Recommended';
  maintenanceWarning?: string | null;
  learningActive?: boolean;
  expectedRange?: string;
  trustScore?: number;
  trustDetails?: TrustScoreDetails;
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

  // Clean Anomaly Details Structured 6-step fields
  whatHappened?: string;
  isGenuineOrSensor?: string;
  shortExplanation?: string;
  expectedBehavior?: string;
  aiEstimatedValue?: number | null;
  estimatedValueDisclaimer?: string;
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
  edgeAiSupport?: {
    enabled: boolean;
    currentMode: string;
    edgeCapable: boolean;
    architecture: string;
  };
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

export interface WhatIfResult {
  status: string;
  tempChange: number;
  humChange: number;
  presChange: number;
  anomalyExpected: boolean;
  sensorFaultPossibility: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedResponse: string[];
  summary: string;
}

