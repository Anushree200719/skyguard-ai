const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  stationId: { type: String, required: true },
  stationName: { type: String },
  sensor: { type: String, default: 'overall' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ['INFO', 'WARNING', 'HIGH RISK', 'CRITICAL'], default: 'WARNING' },
  explanation: { type: String },
  aiConfidence: { type: Number, default: 0.94 },
  anomalyId: { type: String },
  dedupKey: { type: String },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
