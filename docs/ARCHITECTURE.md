# SkyGuard AI System Architecture

## Component Integration Diagram

```
React (TypeScript + Vite + Leaflet)
         │
         ▼  (HTTP / WebSocket)
Node.js + Express.js Server
         │
         ├──► MongoDB (Station & Anomaly Persistence)
         │
         └──► (HTTP POST /predict) ──► Python FastAPI ML Core
                                            │
                                            ├── Isolation Forest Model
                                            ├── PyTorch LSTM Autoencoder
                                            ├── Spatial Consensus Engine
                                            └── SHAP Explainable AI
```

## Spatial Consensus Engine Logic

The Spatial Consensus Engine evaluates geographical proximity (Haversine formula) to distinguish genuine meteorological extreme events from sensor faults:

- **Scenario A (Sensor Fault)**: Station AWS-101 reports 50.0°C. Surrounding stations AWS-102 (37.0°C), AWS-103 (37.5°C), and AWS-104 (37.2°C) report normal values. Ratio of matching neighbors < 50%. Classification: **SENSOR_FAULT**.
- **Scenario B (Genuine Weather Event)**: Stations AWS-101 (45.5°C), AWS-102 (44.8°C), AWS-103 (45.2°C), and AWS-104 (44.5°C) all report elevated values. Ratio of matching neighbors >= 50%. Classification: **GENUINE_WEATHER_EVENT**.
