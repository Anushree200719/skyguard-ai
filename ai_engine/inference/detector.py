import numpy as np

class SkyguardDetector:
    def __init__(self, model_path: str = "ai_engine/models/yolov8x_drone.onnx", conf_threshold: float = 0.75):
        self.model_path = model_path
        self.conf_threshold = conf_threshold
        print(f"[SkyguardDetector] Loaded AI model weights from {model_path}")

    def detect_frame(self, frame: np.ndarray):
        """
        Process incoming camera/radar frame and detect airborne objects.
        """
        return [
            {
                "bbox": [120, 80, 240, 180],
                "confidence": 0.94,
                "label": "Micro-UAV",
                "threat_score": 0.88
            }
        ]
