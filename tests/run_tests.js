const assert = require('assert');
const RuleEngine = require('../server/src/services/ruleEngine');
const SpatialConsensusEngine = require('../server/src/services/spatialConsensus');

console.log("=================================================");
console.log("🧪 RUNNING SKYGUARD AI AUTOMATED TEST SUITE");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [✓] TEST ${total}: ${name} — PASSED`);
    passed++;
  } catch (err) {
    console.error(`  [✗] TEST ${total}: ${name} — FAILED: ${err.message}`);
  }
}

// 1. Test Physical Range Check
test("RuleEngine detects out-of-bounds physical temperature (75°C)", () => {
  const obs = { temperature: 75.0, humidity: 50.0, pressure: 1013.25 };
  const res = RuleEngine.evaluate(obs, []);
  assert.ok(res.classification === 'POSSIBLE_SENSOR_FAULT' || res.classification === 'SENSOR_SPIKE');
  assert.ok(res.anomalyScore > 0.3);
});

// 2. Test Step Change Jump
test("RuleEngine detects sudden 10°C temperature step jump", () => {
  const history = [
    { temperature: 30.0, humidity: 60.0, pressure: 1012.0 },
    { temperature: 30.2, humidity: 60.0, pressure: 1012.0 },
    { temperature: 30.4, humidity: 60.0, pressure: 1012.0 }
  ];
  const obs = { temperature: 41.5, humidity: 55.0, pressure: 1012.0 };
  const res = RuleEngine.evaluate(obs, history);
  assert.strictEqual(res.classification, 'SENSOR_SPIKE');
  assert.ok(res.reasons.some(r => r.includes('step jump') || r.includes('step change')));
});

// 3. Test Frozen Sensor Flatline
test("RuleEngine detects frozen constant temperature (31.4°C)", () => {
  const history = [
    { temperature: 31.4, humidity: 60.0, pressure: 1012.0 },
    { temperature: 31.4, humidity: 60.0, pressure: 1012.0 },
    { temperature: 31.4, humidity: 60.0, pressure: 1012.0 }
  ];
  const obs = { temperature: 31.4, humidity: 60.0, pressure: 1012.0 };
  const res = RuleEngine.evaluate(obs, history);
  assert.strictEqual(res.classification, 'SENSOR_FROZEN');
});

// 4. Test Missing Data
test("RuleEngine flags null temperature as MISSING_DATA", () => {
  const obs = { temperature: null, humidity: 60.0, pressure: 1012.0 };
  const res = RuleEngine.evaluate(obs, []);
  assert.strictEqual(res.classification, 'MISSING_DATA');
  assert.strictEqual(res.severity, 'CRITICAL');
});

// 5. CRITICAL TEST: Single Station 50°C vs Neighbors 37°C -> SENSOR FAULT
test("SpatialConsensus classifies SINGLE station 50°C (neighbors 37°C) as SENSOR FAULT", () => {
  const targetStation = { stationId: 'AWS-101', latitude: 28.6139, longitude: 77.2090 };
  const targetObs = { temperature: 50.0, humidity: 20.0, pressure: 1010.0 };

  const allStations = [
    targetStation,
    { stationId: 'AWS-102', latitude: 28.4595, longitude: 77.0266 },
    { stationId: 'AWS-103', latitude: 28.6280, longitude: 77.3649 },
    { stationId: 'AWS-104', latitude: 28.4089, longitude: 77.3178 }
  ];

  const latestObsMap = {
    'AWS-101': targetObs,
    'AWS-102': { temperature: 37.0, humidity: 45.0, pressure: 1012.0 },
    'AWS-103': { temperature: 37.5, humidity: 44.0, pressure: 1012.0 },
    'AWS-104': { temperature: 37.2, humidity: 45.0, pressure: 1012.0 }
  };

  const res = SpatialConsensusEngine.evaluateSpatialConsensus(targetStation, targetObs, allStations, latestObsMap);
  assert.strictEqual(res.isGenuineEvent, false);
});

// 6. CRITICAL TEST: Multiple Stations 45°C -> GENUINE WEATHER EVENT
test("SpatialConsensus classifies MULTIPLE stations ~45°C as GENUINE WEATHER EVENT", () => {
  const targetStation = { stationId: 'AWS-101', latitude: 28.6139, longitude: 77.2090 };
  const targetObs = { temperature: 45.5, humidity: 18.0, pressure: 998.0 };

  const allStations = [
    targetStation,
    { stationId: 'AWS-102', latitude: 28.4595, longitude: 77.0266 },
    { stationId: 'AWS-103', latitude: 28.6280, longitude: 77.3649 },
    { stationId: 'AWS-104', latitude: 28.4089, longitude: 77.3178 }
  ];

  const latestObsMap = {
    'AWS-101': targetObs,
    'AWS-102': { temperature: 44.8, humidity: 19.0, pressure: 998.5 },
    'AWS-103': { temperature: 45.2, humidity: 18.5, pressure: 998.2 },
    'AWS-104': { temperature: 44.5, humidity: 20.0, pressure: 999.0 }
  };

  const res = SpatialConsensusEngine.evaluateSpatialConsensus(targetStation, targetObs, allStations, latestObsMap);
  assert.strictEqual(res.isGenuineEvent, true);
  assert.ok(res.matchingRatio >= 0.75);
});

console.log("\n-------------------------------------------------");
console.log(`SUMMARY: ${passed}/${total} TESTS PASSED CLEANLY.`);
console.log("-------------------------------------------------\n");

if (passed !== total) {
  process.exit(1);
}
