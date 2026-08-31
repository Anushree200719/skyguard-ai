const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  
  // Raw values
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  pressure: { type: Number, required: true },

  // Corrected values (Estimated if faulty)
  correctedTemperature: { type: Number, default: null },
  correctedHumidity: { type: Number, default: null },
  correctedPressure: { type: Number, default: null },

  qualityFlag: { 
    type: String, 
    enum: ['VALID', 'ESTIMATED', 'SUSPECT', 'INVALID'], 
    default: 'VALID' 
  },
  anomalyScore: { type: Number, default: 0.0 }
}, { timestamps: true });

module.exports = mongoose.model('Observation', ObservationSchema);
