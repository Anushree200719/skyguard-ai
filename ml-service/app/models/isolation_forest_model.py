import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.core.config import settings

class IsolationForestWrapper:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.load_or_create()

    def load_or_create(self):
        if os.path.exists(settings.ISOLATION_FOREST_PATH) and os.path.exists(settings.SCALER_PATH):
            try:
                self.model = joblib.load(settings.ISOLATION_FOREST_PATH)
                self.scaler = joblib.load(settings.SCALER_PATH)
                print("[IsolationForestWrapper] Successfully loaded trained model.")
                return
            except Exception as e:
                print(f"[IsolationForestWrapper] Failed loading saved model: {e}")
        
        # Initialize default model & scaler if not present
        print("[IsolationForestWrapper] Initializing default Isolation Forest...")
        self.scaler = StandardScaler()
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        # Fit with baseline mock synthetic normal data
        X_dummy = np.random.normal(loc=[30.0, 60.0, 1013.25, 0.0, 0.0, 0.0, 0.5, 1.0, 0.2], 
                                  scale=[3.0, 10.0, 5.0, 0.5, 1.5, 0.3, 0.2, 0.4, 0.1], 
                                  size=(500, 9))
        X_scaled = self.scaler.fit_transform(X_dummy)
        self.model.fit(X_scaled)

    def extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """
        Extract temporal & delta features from input dataset.
        Expected columns: temperature, humidity, pressure
        """
        temp = df['temperature'].values
        hum = df['humidity'].values
        pres = df['pressure'].values

        temp_diff = np.diff(temp, prepend=temp[0])
        hum_diff = np.diff(hum, prepend=hum[0])
        pres_diff = np.diff(pres, prepend=pres[0])

        temp_std = pd.Series(temp).rolling(window=5, min_periods=1).std().fillna(0).values
        hum_std = pd.Series(hum).rolling(window=5, min_periods=1).std().fillna(0).values
        pres_std = pd.Series(pres).rolling(window=5, min_periods=1).std().fillna(0).values

        features = np.column_stack([
            temp, hum, pres,
            temp_diff, hum_diff, pres_diff,
            temp_std, hum_std, pres_std
        ])
        return features

    def predict_single(self, current_obs: dict, history: list = None) -> dict:
        """
        Predict anomaly score for current observation given recent history.
        """
        if history and len(history) > 0:
            hist_df = pd.DataFrame(history)
            df = pd.concat([hist_df, pd.DataFrame([current_obs])], ignore_index=True)
        else:
            df = pd.DataFrame([current_obs] * 5) # Fallback window

        features = self.extract_features(df)
        last_feature = features[-1:].reshape(1, -1)

        scaled_feat = self.scaler.transform(last_feature)
        raw_score = self.model.score_samples(scaled_feat)[0] # Score range approx -1 to 0
        is_anomaly = self.model.predict(scaled_feat)[0] == -1

        # Normalize score to 0..1 (1 = extreme anomaly, 0 = normal)
        normalized_score = float(np.clip(1.0 - (raw_score + 0.5) / 0.5, 0.0, 1.0))

        return {
            "score": round(normalized_score, 4),
            "is_anomaly": bool(is_anomaly),
            "raw_score": round(float(raw_score), 4)
        }

iso_forest = IsolationForestWrapper()
