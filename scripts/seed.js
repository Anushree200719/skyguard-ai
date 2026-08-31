const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skyguard';

const StationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: String,
  location: String,
  latitude: Number,
  longitude: Number,
  elevation: Number,
  status: String,
  healthScore: Number,
  lastSeen: Date
});

const ObservationSchema = new mongoose.Schema({
  stationId: String,
  timestamp: Date,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  qualityFlag: String,
  anomalyScore: Number
});

const Station = mongoose.model('Station', StationSchema);
const Observation = mongoose.model('Observation', ObservationSchema);

const INITIAL_STATIONS = [
  { stationId: 'AWS-101', name: 'New Delhi IMD Headquarters', location: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090, elevation: 216, status: 'NORMAL', healthScore: 98 },
  { stationId: 'AWS-102', name: 'Gurugram Cyber City AWS', location: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, elevation: 220, status: 'NORMAL', healthScore: 95 },
  { stationId: 'AWS-103', name: 'Noida Sector 62 AWS', location: 'Noida, Uttar Pradesh', latitude: 28.6280, longitude: 77.3649, elevation: 200, status: 'NORMAL', healthScore: 94 },
  { stationId: 'AWS-104', name: 'Faridabad Industrial AWS', location: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178, elevation: 198, status: 'NORMAL', healthScore: 92 },
  { stationId: 'AWS-201', name: 'Mumbai Colaba Observatory', location: 'Mumbai, Maharashtra', latitude: 18.9067, longitude: 72.8147, elevation: 15, status: 'NORMAL', healthScore: 99 },
  { stationId: 'AWS-202', name: 'Pune Shivajinagar AWS', location: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, elevation: 560, status: 'NORMAL', healthScore: 96 },
  { stationId: 'AWS-301', name: 'Bengaluru IMD Center', location: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, elevation: 920, status: 'NORMAL', healthScore: 100 },
  { stationId: 'AWS-401', name: 'Chennai Nungambakkam AWS', location: 'Chennai, Tamil Nadu', latitude: 13.0604, longitude: 80.2496, elevation: 16, status: 'NORMAL', healthScore: 97 },
  { stationId: 'AWS-501', name: 'Kolkata Alipore AWS', location: 'Kolkata, West Bengal', latitude: 22.5312, longitude: 88.3364, elevation: 9, status: 'NORMAL', healthScore: 95 },
  { stationId: 'AWS-601', name: 'Hyderabad Begumpet AWS', location: 'Hyderabad, Telangana', latitude: 17.4435, longitude: 78.4688, elevation: 531, status: 'NORMAL', healthScore: 98 }
];

async function seed() {
  try {
    console.log('⚡ [Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    await Station.deleteMany({});
    await Observation.deleteMany({});
    
    await Station.insertMany(INITIAL_STATIONS);
    console.log(`  [+] Seeded ${INITIAL_STATIONS.length} stations successfully.`);

    // Seed 24 hours of baseline observations for each station
    const now = new Date();
    const obsList = [];

    for (const st of INITIAL_STATIONS) {
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600 * 1000);
        const temp = 30.0 + 5.0 * Math.sin(i / 4) + (Math.random() * 0.4 - 0.2);
        const hum = 60.0 - 10.0 * Math.sin(i / 4) + (Math.random() * 1.0 - 0.5);
        const pres = 1012.0 + (Math.random() * 0.4 - 0.2);

        obsList.push({
          stationId: st.stationId,
          timestamp: time,
          temperature: Number(temp.toFixed(2)),
          humidity: Number(hum.toFixed(2)),
          pressure: Number(pres.toFixed(2)),
          qualityFlag: 'VALID',
          anomalyScore: 0.02
        });
      }
    }

    await Observation.insertMany(obsList);
    console.log(`  [+] Seeded ${obsList.length} historical observations.`);
    console.log('✅ [Seed] Database seeding completed cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed] Error during seeding:', err.message);
    process.exit(1);
  }
}

seed();
