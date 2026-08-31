const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  
  // 6 Primary Parameters
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null },
  pressure: { type: Number, default: null },
  windSpeed: { type: Number, default: null },
  windDirection: { type: Number, default: null },
  rainfall: { type: Number, default: null },

  // Corrected / Imputed Values
  correctedTemperature: { type: Number, default: null },
  correctedHumidity: { type: Number, default: null },
  correctedPressure: { type: Number, default: null },
  correctedWindSpeed: { type: Number, default: null },
  correctedRainfall: { type: Number, default: null },

  imputationMethod: { type: String, default: 'Time-Series Imputation + Nearby Station Comparison' },
  qualityFlag: { 
    type: String, 
    enum: ['VALID', 'ESTIMATED', 'SUSPECT', 'INVALID'], 
    default: 'VALID' 
  },
  anomalyScore: { type: Number, default: 0.0 }
}, { timestamps: true });

module.exports = mongoose.model('Observation', ObservationSchema);
