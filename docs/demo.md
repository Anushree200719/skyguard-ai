# SkyGuard AI Demonstration Guide

Run the automated demonstration suite:

```bash
npm run demo
```

## Step-by-Step Scenario Verified by Suite:

1. **Baseline Nominal Weather**: All 10 AWS stations across India report normal diurnal temperature curves.
2. **Sensor Spike Injection**: 58.7°C spike injected into AWS-101. Trust layer flags `SENSOR_SPIKE`.
3. **Sensor Drift Injection**: Monotonic drift injected into AWS-102. Trust layer flags `SENSOR_DRIFT` and decays health score.
4. **Frozen Sensor Injection**: Constant 31.4°C output injected into AWS-103. Trust layer flags `SENSOR_FROZEN`.
5. **Genuine Regional Heatwave**: 45.8°C heatwave injected across NCR stations (AWS-101, AWS-102, AWS-103, AWS-104). Spatial Consensus confirms 100% neighbor agreement and classifies as `GENUINE_WEATHER_EVENT` without marking sensors faulty!
