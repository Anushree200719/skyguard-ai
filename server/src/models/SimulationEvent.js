const mongoose = require('mongoose');

const SimulationEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  targetStationId: { type: String, required: true },
  parameter: { type: String, default: 'temperature' },
  severity: { type: String, default: 'HIGH' },
  durationSeconds: { type: Number, default: 60 },
  active: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SimulationEvent', SimulationEventSchema);
