const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  stationId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL', 'WEATHER_EVENT'], default: 'WARNING' },
  anomalyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Anomaly' },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
