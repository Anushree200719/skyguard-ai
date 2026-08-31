from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import random
import time

app = FastAPI(title="Skyguard AI Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "Skyguard AI Core",
        "timestamp": time.time()
    }

@app.get("/api/targets")
def get_active_targets():
    return {
        "targets": [
            {"id": "TRK-901", "azimuth": 45.2, "range_km": 4.2, "alt_m": 240, "speed_m_s": 18.5, "threat": "YELLOW", "class": "Quadcopter"},
            {"id": "TRK-408", "azimuth": 198.6, "range_km": 9.8, "alt_m": 610, "speed_m_s": 42.0, "threat": "RED", "class": "Fixed-Wing UAV"}
        ]
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            telemetry_data = {
                "timestamp": time.time(),
                "radar_sweep_deg": (time.time() * 90) % 360,
                "active_tracks": random.randint(2, 6)
            }
            await websocket.send_text(json.dumps(telemetry_data))
            await asyncio.sleep(0.1)
    except Exception:
        pass
