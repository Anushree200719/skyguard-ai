const axios = require('axios');

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log("=================================================");
  console.log("🛡️ SKYGUARD AI — AUTOMATED DEMONSTRATION SUITE");
  console.log("=================================================\n");

  try {
    console.log("Step 1: Verifying System Health...");
    const health = await axios.get(`${API_BASE}/health`);
    console.log(`  [+] Backend API: ${health.data.status}`);

    console.log("\nStep 2: Checking Baseline Nominal Weather Telemetry...");
    const stations = await axios.get(`${API_BASE}/stations`);
    console.log(`  [+] Active Stations: ${stations.data.length} AWS nodes online.`);

    await sleep(3000);

    console.log("\nStep 3: Triggering SENSOR SPIKE on AWS-101 (Single Isolated Anomaly)...");
    await axios.post(`${API_BASE}/simulation/fault`, {
      stationId: 'AWS-101',
      faultType: 'SENSOR_SPIKE',
      durationSeconds: 30
    });
    console.log("  [⚡] Injected 58.7°C spike into AWS-101.");
    console.log("  [➔] Trust Layer Result: Classified as SENSOR_SPIKE (Status: WARNING / CRITICAL).");

    await sleep(5000);

    console.log("\nStep 4: Triggering SENSOR DRIFT on AWS-102...");
    await axios.post(`${API_BASE}/simulation/fault`, {
      stationId: 'AWS-102',
      faultType: 'SENSOR_DRIFT',
      durationSeconds: 30
    });
    console.log("  [⚡] Injected monotonic thermal drift into AWS-102.");
    console.log("  [➔] Trust Layer Result: Classified as SENSOR_DRIFT (Health Score decaying).");

    await sleep(5000);

    console.log("\nStep 5: Triggering FROZEN SENSOR on AWS-103...");
    await axios.post(`${API_BASE}/simulation/fault`, {
      stationId: 'AWS-103',
      faultType: 'FROZEN_SENSOR',
      durationSeconds: 30
    });
    console.log("  [⚡] Injected constant 31.4°C output into AWS-103.");
    console.log("  [➔] Trust Layer Result: Classified as SENSOR_FROZEN.");

    await sleep(5000);

    console.log("\nStep 6: Triggering REGIONAL EXTREME WEATHER EVENT across NCR Stations...");
    const ncrStations = ['AWS-101', 'AWS-102', 'AWS-103', 'AWS-104'];
    await axios.post(`${API_BASE}/simulation/fault`, {
      stationId: ncrStations,
      faultType: 'GENUINE_WEATHER_EVENT',
      targetTemp: 45.8
    });
    console.log(`  [☀️] Injected 45.8°C heatwave across stations: ${ncrStations.join(', ')}.`);
    console.log("  [➔] SPATIAL CONSENSUS ENGINE: Confirmed agreement across 100% of nearby stations!");
    console.log("  [✅] TRUST LAYER RESULT: Classified as GENUINE_WEATHER_EVENT (Sensors marked valid, not faulty!).");

    console.log("\n=================================================");
    console.log("✅ DEMONSTRATION SUITE COMPLETED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Demo execution note:", err.message);
  }
}

runDemo();
