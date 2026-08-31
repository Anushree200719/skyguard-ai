import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.services.hybrid_engine import hybrid_engine
from app.models.isolation_forest_model import iso_forest
from app.models.lstm_autoencoder_model import lstm_ae

app = FastAPI(
    title="SkyGuard AI ML Service",
    version="1.0.0",
    description="Machine Learning & Hybrid Decision Engine for Automatic Weather Stations"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# Pydantic Schemas
# ----------------------------------------------------
class Observation(BaseModel):
    temperature: float = Field(..., example=32.5)
    humidity: float = Field(..., example=65.0)
    pressure: float = Field(..., example=1012.3)
    timestamp: Optional[str] = None

class PredictionRequest(BaseModel):
    station_id: str = Field(..., example="AWS-001")
    current_observation: Observation
    history: Optional[List[Observation]] = []
    nearby_stations_observations: Optional[List[Observation]] = []

class HealthPredictionRequest(BaseModel):
    station_id: str = Field(..., example="AWS-001")
    current_health: float = Field(100.0, example=85.0)
    recent_anomalies_count: int = Field(0, example=3)
    historical_observations_count: int = Field(100, example=150)

# ----------------------------------------------------
# API Endpoints
# ----------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SkyGuard AI ML Engine",
        "models": {
            "isolation_forest": "active",
            "lstm_autoencoder": "active",
            "spatial_consensus": "active"
        },
        "timestamp": time.time()
    }

@app.post("/predict/anomaly")
def predict_anomaly(payload: PredictionRequest):
    try:
        current_dict = payload.current_observation.dict()
        history_dicts = [h.dict() for h in payload.history] if payload.history else []
        nearby_dicts = [n.dict() for n in payload.nearby_stations_observations] if payload.nearby_stations_observations else []

        eval_result = hybrid_engine.evaluate_observation(
            station_id=payload.station_id,
            current_obs=current_dict,
            history=history_dicts,
            nearby_stations_obs=nearby_dicts
        )
        return eval_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly evaluation failed: {str(e)}")

@app.post("/predict/classification")
def predict_classification(payload: PredictionRequest):
    return predict_anomaly(payload)

@app.post("/predict/health")
def predict_health(payload: HealthPredictionRequest):
    """
    Computes updated sensor health score (0..100) based on anomaly counts & historical performance.
    """
    decay = payload.recent_anomalies_count * 5.0
    updated_health = max(0.0, min(100.0, payload.current_health - decay))

    status = "GOOD" if updated_health >= 90 else ("WARNING" if updated_health >= 70 else ("POOR" if updated_health >= 50 else "CRITICAL"))
    recommendation = "Maintain regular inspection schedule" if status == "GOOD" else "Schedule maintenance check"

    return {
        "station_id": payload.station_id,
        "previous_health": payload.current_health,
        "new_health": round(updated_health, 1),
        "status": status,
        "recommendation": recommendation
    }

@app.post("/explain")
def explain_anomaly(payload: PredictionRequest):
    res = predict_anomaly(payload)
    return {
        "station_id": payload.station_id,
        "classification": res.get("classification"),
        "reasons": res.get("reasons"),
        "shap_explanation": res.get("shap_explanation"),
        "probable_cause": res.get("probable_cause"),
        "recommended_action": res.get("recommended_action")
    }
