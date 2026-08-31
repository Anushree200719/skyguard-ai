const mongoose = require('mongoose');

const HealthScoreSchema = new mongoose.Schema({
  stationId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  score: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['GOOD', 'WARNING', 'POOR', 'CRITICAL'], required: true },
  factors: {
    completeness: { type: Number, default: 100 },
    anomalyFrequency: { type: Number, default: 0 },
    driftSeverity: { type: Number, default: 0 },
    communicationReliability: { type: Number, default: 100 }
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthScore', HealthScoreSchema);
