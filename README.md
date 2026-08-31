# 🛡️ SkyGuard AI — AI-Powered Trust Layer for Automatic Weather Stations

> **Intelligent Weather-Data Quality & Sensor-Health Monitoring Platform**
> Distinguishes genuine extreme weather events from faulty sensors using Rule-Based QC, Isolation Forest, PyTorch LSTM Autoencoders, and Spatial Consensus.

---

## 🚀 Key Features

- **Spatial Consensus Engine**: Accurately distinguishes a single faulty sensor (e.g. AWS-101 reporting 50°C while nearby report 37°C ➔ `SENSOR_FAULT`) from genuine extreme weather (e.g. AWS-101, AWS-102, AWS-103 all reporting ~45°C ➔ `GENUINE_WEATHER_EVENT`).
- **Hybrid AI Decision Engine**: Combines physical rule checks, Scikit-learn Isolation Forest, PyTorch LSTM Autoencoder sequence error scoring, and SHAP explainability.
- **Sensor Health & Predictive Maintenance**: Continuously tracks sensor health scores (0–100) and builds priority maintenance queues.
- **Corrected Value Estimation**: Calculates estimated values (`ESTIMATED`) for faulty readings without overwriting raw sensor observations.
- **Interactive Fault Injection Simulator**: Inject sensor spikes, drift, frozen sensors, noise, data gaps, or extreme heatwaves directly into real-time Socket.IO streams.
- **Graceful Fallback**: Automatically falls back to the rule-based engine with an `ML SERVICE OFFLINE` indicator if the Python ML service is unreachable.

---

## 📂 Project Structure

```
SkyGuard-AI/
├── README.md
├── .env.example
├── docker-compose.yml
├── client/                     # React + TypeScript + Vite + Tailwind CSS + Leaflet
├── server/                     # Node.js + Express.js + Socket.IO + Mongoose
├── ml-service/                 # Python 3.11+ FastAPI + Scikit-learn + PyTorch + SHAP
├── data/                       # Seed dataset generators
├── tests/                      # Automated test suite
├── docs/                       # Architecture, API specs, ML pipeline, Demo guides
└── scripts/                    # seed.js, demo.js, build_zip.js
```

---

## 🛠️ Quick Start Guide

### Option A: Local Development (Without Docker)

#### 1. Python ML Service
```bash
cd ml-service
python -m venv venv

# Windows activation:
venv\Scripts\activate

# Install dependencies & train model weights:
pip install -r requirements.txt
python scripts/train_models.py

# Start FastAPI server:
uvicorn app.main:app --reload --port 8000
```

#### 2. Node.js Backend Server
```bash
cd server
npm install
npm run dev
```

#### 3. React Frontend Client
```bash
cd client
npm install
npm run dev
```

#### 4. Seed Database & Run Automated Tests
```bash
npm run seed
npm run test
```

---

### Option B: Docker Compose

Start the entire full-stack application (MongoDB, Python ML Service, Node.js Backend, React Frontend) in one command:

```bash
docker compose up --build
```

Access Default URLs:
- **Frontend Dashboard**: `http://localhost:5173`
- **Node.js Express Backend**: `http://localhost:5000`
- **Python FastAPI ML Engine**: `http://localhost:8000`

---

## 🧪 Automated Testing & Demonstration Suite

### Run Unit & Integration Tests
```bash
npm run test
```
Tests range validation, step jumps, flatlines, and verifies that single station 50°C is classified as `SENSOR_FAULT` while multi-station 45°C is classified as `GENUINE_WEATHER_EVENT`.

### Run Interactive Demonstration
```bash
npm run demo
```

---

## 📦 Distribution Package
To build the standalone zip archive:
```bash
npm run build:zip
```
Generates `SkyGuard-AI.zip` containing complete source code, tests, documentation, and trained model weights.
