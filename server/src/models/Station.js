const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  elevation: { type: Number, default: 100 },
  status: { 
    type: String, 
    enum: ['NORMAL', 'WARNING', 'CRITICAL', 'WEATHER_EVENT'], 
    default: 'NORMAL' 
  },
  healthScore: { type: Number, default: 100, min: 0, max: 100 },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Station', StationSchema);
