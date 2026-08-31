const mongoose = require('mongoose');

const AnomalySchema = new mongoose.Schema({
  stationId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  parameter: { type: String, enum: ['temperature', 'humidity', 'pressure', 'multivariate', 'all'], required: true },
  
  anomalyType: { 
    type: String, 
    enum: [
      'NORMAL', 'GENUINE_WEATHER_EVENT', 'SENSOR_SPIKE', 'SENSOR_DRIFT', 
      'SENSOR_FROZEN', 'SENSOR_NOISE', 'MISSING_DATA', 'COMMUNICATION_FAILURE', 
      'MULTIVARIATE_INCONSISTENCY'
    ], 
    required: true 
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  anomalyScore: { type: Number, required: true },
  confidence: { type: Number, default: 0.9 },
  
  probableCause: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  reasons: [{ type: String }],
  
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Anomaly', AnomalySchema);
