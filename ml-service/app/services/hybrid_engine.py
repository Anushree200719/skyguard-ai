import math
import numpy as np

class HybridDecisionEngine:
    """
    AI Decision Engine for Automatic Weather Stations (AWS)
    Supports 6-parameter analysis, spatial consensus, and per-sensor health scores.
    """

    @staticmethod
    def calculate_distance_km(lat1, lon1, lat2, lon2):
        R = 6371.0
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
        wind = current_obs.get('windSpeed')
        rain = current_obs.get('rainfall')

        reasons = []
        rule_score = 0.0
        anomaly_type = "NORMAL"
        target_sensor = "temperature"

        # ----------------------------------------------------
        # 1. Rule-Based Physical Quality Control
        # ----------------------------------------------------
        if temp is None or hum is None or pres is None:
            return {
                "classification": "MISSING_DATA",
                "severity": "CRITICAL",
                "anomaly_score": 1.0,
                "confidence": 0.99,
                "target_sensor": "temperature",
                "probable_cause": "Telemetry Packet Loss / Disconnected Sensor Node",
                "recommended_action": "Check telemetry receiver antenna and power supply",
                "reasons": ["Primary meteorological parameters missing from telemetry packet"],
                "health_impact": -25
            }

        if not (-50.0 <= temp <= 60.0):
            rule_score += 0.55
            target_sensor = "temperature"
            reasons.append(f"Temperature {temp}°C out of physical boundary (-50°C to 60°C)")
        if not (0.0 <= hum <= 100.0):
            rule_score += 0.55
            target_sensor = "humidity"
            reasons.append(f"Humidity {hum}% out of physical boundary (0% to 100%)")
        if not (800.0 <= pres <= 1100.0):
            rule_score += 0.55
            target_sensor = "pressure"
            reasons.append(f"Pressure {pres} hPa out of physical boundary (800..1100 hPa)")
        if wind is not None and (wind < 0.0 or wind > 120.0):
            rule_score += 0.5
            target_sensor = "wind"
            reasons.append(f"Wind speed {wind} m/s out of physical boundary (0..120 m/s)")
        if rain is not None and rain < 0.0:
            rule_score += 0.5
            target_sensor = "rainfall"
            reasons.append(f"Negative rainfall value {rain} mm detected")

        # Temporal Step Change & Frozen Sensor Checks
        if len(history) >= 3:
            recent_temps = [obs['temperature'] for obs in history[-5:] if obs.get('temperature') is not None]
            if recent_temps:
                step = abs(temp - recent_temps[-1])
                if step >= 8.0:
                    rule_score += 0.6
                    target_sensor = "temperature"
                    reasons.append(f"Sudden temperature step jump detected: Δ{step:.1f}°C in single cycle")
                    anomaly_type = "SENSOR_SPIKE"

                if len(recent_temps) >= 4 and all(abs(t - temp) < 0.001 for t in recent_temps[-3:]):
                    rule_score += 0.65
                    target_sensor = "temperature"
                    reasons.append("Frozen thermistor output constant across 4 consecutive cycles")
                    anomaly_type = "SENSOR_FROZEN"

        # ----------------------------------------------------
        # 2. SPATIAL CONSENSUS ENGINE (Event vs Sensor Fault)
        # ----------------------------------------------------
        nearby_temps = [ns.get('temperature', 30.0) for ns in nearby_stations_obs if ns.get('temperature') is not None]
        matching_neighbors = 0
        spatial_ratio = 0.0
        avg_nearby_temp = temp

        if nearby_temps:
            avg_nearby_temp = float(np.mean(nearby_temps))
            matching_neighbors = sum(1 for nt in nearby_temps if abs(nt - temp) <= 3.5)
            spatial_ratio = matching_neighbors / len(nearby_temps)

        is_spatial_event = (spatial_ratio >= 0.5) and (temp > 40.0)
        is_isolated_fault = (len(nearby_temps) >= 2) and (abs(temp - avg_nearby_temp) > 6.0)

        # ----------------------------------------------------
        # 3. Final Classification & Supporting Evidence
        # ----------------------------------------------------
        combined_score = round(min(1.0, rule_score), 4)

        if combined_score < 0.25 and not is_spatial_event and not is_isolated_fault:
            classification = "NORMAL"
            severity = "LOW"
            probable_cause = "Nominal Environmental Variations"
            recommended_action = "Routine telemetry collection active"
            confidence = 0.95
            health_impact = 0
        elif is_spatial_event:
            classification = "GENUINE_WEATHER_EVENT"
            severity = "HIGH" if temp > 44.0 else "MEDIUM"
            probable_cause = "Regional Extreme Heatwave / Extreme Weather Event"
            recommended_action = "Issue extreme weather advisory; sensors operating nominally"
            confidence = 0.94
            health_impact = 0
            reasons.append(f"Spatial Consensus CONFIRMED: {matching_neighbors}/{len(nearby_temps)} nearby stations confirm regional extreme condition (~{avg_nearby_temp:.1f}°C)")
        elif is_isolated_fault or rule_score > 0.4:
            classification = anomaly_type if anomaly_type != "NORMAL" else "POSSIBLE_SENSOR_FAULT"
            severity = "CRITICAL" if temp > 55.0 else "HIGH"
            probable_cause = "Thermal element calibration drift or electrical noise disturbance"
            recommended_action = "Mark station for diagnostic inspection and sensor calibration"
            confidence = round(min(0.98, 0.85 + combined_score * 0.1), 2)
            health_impact = -12
            reasons.append(f"Spatial Mismatch: Target reading ({temp}°C) differs by {abs(temp - avg_nearby_temp):.1f}°C from regional average ({avg_nearby_temp:.1f}°C)")
        else:
            classification = "UNCERTAIN_EVENT"
            severity = "MEDIUM"
            probable_cause = "Unusual local microclimate or minor sensor calibration noise"
            recommended_action = "Monitor station for next 3 telemetry cycles"
            confidence = 0.75
            health_impact = -4

        if not reasons:
            reasons.append("All 6 meteorological parameter checks within expected physical envelope")

        return {
            "classification": classification,
            "severity": severity,
            "anomaly_score": combined_score,
            "confidence": confidence,
            "target_sensor": target_sensor,
            "probable_cause": probable_cause,
            "recommended_action": recommended_action,
            "reasons": reasons,
            "health_impact": health_impact
        }

hybrid_engine = HybridDecisionEngine()
