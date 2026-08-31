# SkyGuard AI Machine Learning Pipeline

## 1. Isolation Forest Model (Scikit-Learn)
- Features: Temperature, Humidity, Pressure, First-order temporal deltas, Moving 5-cycle standard deviations.
- Contamination rate: 0.05.
- Normalizes raw anomaly scores to [0.0, 1.0].

## 2. PyTorch LSTM Autoencoder
- Sequence length: 24 observations.
- Input dimension: 3 (Normalized Temp, Hum, Pres).
- Architecture: LSTM Encoder (hidden_dim=16, latent_dim=8) ➔ Linear ➔ LSTM Decoder.
- Reconstruction MSE Loss normalized to anomaly score.

## 3. Hybrid Decision Engine
- Combines Rule QC (40%) + Isolation Forest (30%) + PyTorch LSTM (30%).
- Integrates Spatial Consensus Engine to verify regional weather correlation.
