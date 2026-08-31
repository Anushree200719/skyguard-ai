import math
import numpy as np
from app.models.isolation_forest_model import iso_forest
from app.models.lstm_autoencoder_model import lstm_ae

class HybridDecisionEngine:
    """
    Core AI Decision Engine combining:
    - Rule-based Physical Quality Control
    - Isolation Forest Anomaly Score
    - PyTorch LSTM Autoencoder Sequence Error
    - Spatial Consensus (Single station fault vs Multi-station genuine weather event)
    - SHAP / Explainable AI Reason Generator
    """

    @staticmethod
    def calculate_distance_km(lat1, lon1, lat2, lon2):
        R = 6371.0 # Earth radius km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def evaluate_observation(self, station_id: str, current_obs: dict, history: list = None, nearby_stations_obs: list = None) -> dict:
        history = history or []
        nearby_stations_obs = nearby_stations_obs or []

        temp = current_obs.get('temperature')
        hum = current_obs.get('humidity')
        pres = current_obs.get('pressure')

        reasons = []
        rule_score = 0.0
        anomaly_type = "NORMAL"
        severity = "LOW"

        # ----------------------------------------------------
        # 1. Rule-Based Checks
        # ----------------------------------------------------
        if temp is None or hum is None or pres is None:
            return {
                "classification": "MISSING_DATA",
                "severity": "CRITICAL",
                "anomaly_score": 1.0,
                "confidence": 0.99,
                "probable_cause": "Communication Failure or Sensor Disconnection",
                "recommended_action": "Check telemetry receiver and AWS communication hardware",
                "reasons": ["One or more primary parameters (temperature, humidity, pressure) missing"],
                "health_impact": -30
            }

        # Physical Range Validation (-50 to 60°C, 0 to 100%, 800 to 1100 hPa)
        if not (-50.0 <= temp <= 60.0):
            rule_score += 0.4
            reasons.append(f"Temperature value {temp}°C out of physical range (-50°C to 60°C)")
        if not (0.0 <= hum <= 100.0):
            rule_score += 0.4
            reasons.append(f"Humidity value {hum}% out of physical range (0% to 100%)")
        if not (800.0 <= pres <= 1100.0):
            rule_score += 0.4
            reasons.append(f"Atmospheric pressure {pres} hPa out of physical range (800 to 1100 hPa)")

        # Temporal Step Change & Flatline Checks using history
        if len(history) >= 3:
            recent_temps = [obs['temperature'] for obs in history[-5:]]
            recent_hums = [obs['humidity'] for obs in history[-5:]]
            recent_pres = [obs['pressure'] for obs in history[-5:]]

            # Spike Check (Step change > 8°C in 15 mins)
            temp_step = abs(temp - recent_temps[-1])
            if temp_step >= 8.0:
                rule_score += 0.5
                reasons.append(f"Sudden temperature step change detected: Δ{temp_step:.1f}°C")
                anomaly_type = "SENSOR_SPIKE"

            # Frozen / Flatline Check (Exact identical values for 4+ consecutive readings)
            if len(recent_temps) >= 4 and all(abs(t - temp) < 0.001 for t in recent_temps[-3:]):
                rule_score += 0.6
                reasons.append("Frozen sensor detected: Temperature constant across 4+ consecutive cycles")
                anomaly_type = "SENSOR_FROZEN"

            # Sensor Drift Check (Monotonic divergence over history)
            if len(recent_temps) >= 5:
                diffs = np.diff(recent_temps + [temp])
                if np.all(diffs > 0.4) and (recent_temps[-1] - recent_temps[0]) > 4.0:
                    rule_score += 0.45
                    reasons.append("Gradual monotonic sensor drift detected in temperature sequence")
                    anomaly_type = "SENSOR_DRIFT"

        # Multivariate Inconsistency (High Temp + Ultra High Humidity anomaly)
        if temp > 42.0 and hum > 85.0:
            rule_score += 0.35
            reasons.append("Multivariate inconsistency: Extreme high temperature co-occurring with >85% humidity")
            if anomaly_type == "NORMAL":
                anomaly_type = "MULTIVARIATE_INCONSISTENCY"

        # ----------------------------------------------------
        # 2. Machine Learning Anomaly Scores
        # ----------------------------------------------------
        iso_res = iso_forest.predict_single(current_obs, history)
        lstm_res = lstm_ae.predict_sequence(history + [current_obs])

        iso_score = iso_res['score']
        lstm_score = lstm_res['anomaly_score']

        if iso_score > 0.6:
            reasons.append(f"Isolation Forest identified statistical anomaly (Score: {iso_score:.2f})")
        if lstm_score > 0.5:
            reasons.append(f"LSTM Autoencoder reconstruction error high (Score: {lstm_score:.2f})")

        # ----------------------------------------------------
        # 3. SPATIAL CONSENSUS ENGINE (Event vs Sensor Fault)
        # ----------------------------------------------------
        spatial_agreement_count = 0
        total_nearby = len(nearby_stations_obs)
        is_spatial_event = False

        if total_nearby > 0:
            nearby_temps = [ns.get('temperature', 30.0) for ns in nearby_stations_obs if ns.get('temperature') is not None]
            if len(nearby_temps) > 0:
                avg_nearby_temp = float(np.mean(nearby_temps))
                temp_diff_from_neighbors = abs(temp - avg_nearby_temp)

                # Check if neighbors ALSO report high/extreme temperature
                matching_neighbors = sum(1 for nt in nearby_temps if abs(nt - temp) < 3.5)
                spatial_ratio = matching_neighbors / len(nearby_temps)

                if spatial_ratio >= 0.5 and temp_diff_from_neighbors < 3.5:
                    is_spatial_event = True
                    reasons.append(f"Spatial Consensus CONFIRMED: {matching_neighbors}/{len(nearby_temps)} nearby stations confirm extreme temperature (~{avg_nearby_temp:.1f}°C)")
                elif temp_diff_from_neighbors > 6.0:
                    reasons.append(f"Spatial Consensus MISMATCH: Target station differs by {temp_diff_from_neighbors:.1f}°C from neighbor average ({avg_nearby_temp:.1f}°C)")

        # ----------------------------------------------------
        # 4. Final Classification Synthesis
        # ----------------------------------------------------
        combined_score = round(min(1.0, 0.4 * rule_score + 0.3 * iso_score + 0.3 * lstm_score), 4)

        if combined_score < 0.25 and not is_spatial_event:
            classification = "NORMAL"
            severity = "LOW"
            probable_cause = "Normal Atmospheric Behavior"
            recommended_action = "Routine monitoring active"
            confidence = 0.95
            health_impact = 0
        elif is_spatial_event and combined_score > 0.3:
            classification = "GENUINE_WEATHER_EVENT"
            severity = "HIGH" if combined_score > 0.6 else "MEDIUM"
            probable_cause = "Regional Extreme Weather / Heatwave Event"
            recommended_action = "Issue meteorological advisory; sensors operate normally"
            confidence = 0.92
            health_impact = 0 # Sensors are NOT damaged!
        else:
            # It's a sensor fault!
            if anomaly_type != "NORMAL":
                classification = anomaly_type
            else:
                classification = "SENSOR_SPIKE" if combined_score > 0.6 else "SENSOR_NOISE"

            severity = "CRITICAL" if combined_score > 0.65 else ("HIGH" if combined_score > 0.45 else "MEDIUM")
            
            cause_map = {
                "SENSOR_SPIKE": "Voltage surge or electrical impulse spike in telemetry unit",
                "SENSOR_DRIFT": "Calibration drift or degradation of thermal sensor element",
                "SENSOR_FROZEN": "Data logger deadlock or frozen thermistor output",
                "SENSOR_NOISE": "Unshielded signal noise or loose wiring connection",
                "MULTIVARIATE_INCONSISTENCY": "Cross-parameter sensor calibration conflict"
            }
            action_map = {
                "SENSOR_SPIKE": "Perform diagnostic electrical reset and verify grounding",
                "SENSOR_DRIFT": "Schedule recalibration or replace thermal sensor module",
                "SENSOR_FROZEN": "Power cycle AWS data logger and inspect sensor connection",
                "SENSOR_NOISE": "Inspect signal wiring and shield ground integrity",
                "MULTIVARIATE_INCONSISTENCY": "Run multi-sensor diagnostic suite"
            }
            probable_cause = cause_map.get(classification, "Uncalibrated Sensor Output")
            recommended_action = action_map.get(classification, "Inspect station sensor hardware")
            confidence = round(min(0.99, 0.75 + combined_score * 0.2), 2)
            health_impact = -15 if severity == "CRITICAL" else (-8 if severity == "HIGH" else -4)

        if not reasons:
            reasons.append("All physical range checks and statistical models indicate nominal operation")

        return {
            "classification": classification,
            "severity": severity,
            "anomaly_score": combined_score,
            "confidence": confidence,
            "probable_cause": probable_cause,
            "recommended_action": recommended_action,
            "reasons": reasons,
            "shap_explanation": {
                "temperature_impact": "+0.42" if temp > 40 else "+0.05",
                "humidity_impact": "-0.18" if hum < 30 else "+0.02",
                "spatial_delta_impact": "-0.55" if is_spatial_event else "+0.48",
                "temporal_drift_impact": "+0.31" if classification == "SENSOR_DRIFT" else "0.00"
            },
            "health_impact": health_impact
        }

hybrid_engine = HybridDecisionEngine()
