# SkyGuard AI REST & WebSocket API Specification

## Node.js Express Endpoints (Port 5000)

- `GET /api/stations`: Returns list of all AWS stations and health scores.
- `GET /api/stations/:id`: Returns single station metadata.
- `GET /api/stations/:id/observations`: Returns historical observations.
- `GET /api/anomalies`: Filterable list of anomalies (`?station=`, `?type=`, `?severity=`).
- `GET /api/alerts`: List of system alerts and status.
- `POST /api/alerts/:id/acknowledge`: Mark alert as acknowledged.
- `GET /api/analytics`: High-level quality score summary.
- `GET /api/maintenance`: Priority-ranked maintenance queue.
- `POST /api/simulation/fault`: Inject fault payload into station telemetry.
- `POST /api/simulation/speed`: Set simulation speed multiplier.

## Python FastAPI ML Endpoints (Port 8000)

- `POST /predict/anomaly`: Runs Hybrid Decision Engine on current observation.
- `POST /predict/classification`: Classification output with probable cause and SHAP.
- `POST /predict/health`: Calculates updated health score (0..100).
- `POST /explain`: Generates feature attribution breakdown.
