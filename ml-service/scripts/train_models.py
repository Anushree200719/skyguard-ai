import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import torch
import torch.nn as nn

print("[Train Script] Training SkyGuard AI Machine Learning Models...")

os.makedirs("trained_models/isolation_forest", exist_ok=True)
os.makedirs("trained_models/lstm_autoencoder", exist_ok=True)

# 1. Generate Synthetic Normal Weather Observations
np.random.seed(42)
num_samples = 2000

# Base temperature wave + noise
time_steps = np.linspace(0, 100, num_samples)
temp = 28.0 + 8.0 * np.sin(time_steps / 10) + np.random.normal(0, 1.2, num_samples)
hum = 65.0 - 15.0 * np.sin(time_steps / 10) + np.random.normal(0, 3.0, num_samples)
pres = 1013.25 - 3.0 * np.cos(time_steps / 20) + np.random.normal(0, 1.0, num_samples)

temp_diff = np.diff(temp, prepend=temp[0])
hum_diff = np.diff(hum, prepend=hum[0])
pres_diff = np.diff(pres, prepend=pres[0])

temp_std = pd.Series(temp).rolling(5, min_periods=1).std().fillna(0.5).values
hum_std = pd.Series(hum).rolling(5, min_periods=1).std().fillna(1.0).values
pres_std = pd.Series(pres).rolling(5, min_periods=1).std().fillna(0.2).values

X = np.column_stack([temp, hum, pres, temp_diff, hum_diff, pres_diff, temp_std, hum_std, pres_std])

# Train Isolation Forest
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

iso_forest = IsolationForest(n_estimators=150, contamination=0.03, random_state=42)
iso_forest.fit(X_scaled)

joblib.dump(iso_forest, "trained_models/isolation_forest/iso_forest.pkl")
joblib.dump(scaler, "trained_models/isolation_forest/scaler.pkl")
print("  [+] Saved Isolation Forest model to trained_models/isolation_forest/")

# 2. Train PyTorch LSTM Autoencoder
class PyTorchLSTMAutoencoder(nn.Module):
    def __init__(self, input_dim=3, hidden_dim=16, latent_dim=8):
        super(PyTorchLSTMAutoencoder, self).__init__()
        self.encoder_lstm = nn.LSTM(input_dim, hidden_dim, batch_first=True)
        self.encoder_fc = nn.Linear(hidden_dim, latent_dim)
        
        self.decoder_fc = nn.Linear(latent_dim, hidden_dim)
        self.decoder_lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)
        self.output_fc = nn.Linear(hidden_dim, input_dim)

    def forward(self, x):
        batch_size, seq_len, _ = x.shape
        _, (h_n, _) = self.encoder_lstm(x)
        latent = self.encoder_fc(h_n.squeeze(0))
        
        decoder_input = self.decoder_fc(latent).unsqueeze(1).repeat(1, seq_len, 1)
        decoder_out, _ = self.decoder_lstm(decoder_input)
        reconstructed = self.output_fc(decoder_out)
        return reconstructed

# Create sequences of length 24
raw_features = np.column_stack([temp, hum, pres])
mean = np.array([30.0, 60.0, 1013.25])
std = np.array([5.0, 15.0, 10.0])
norm_features = (raw_features - mean) / std

seq_len = 24
sequences = []
for i in range(len(norm_features) - seq_len):
    sequences.append(norm_features[i:i+seq_len])
sequences = np.array(sequences)

tensor_seqs = torch.tensor(sequences, dtype=torch.float32)

model = PyTorchLSTMAutoencoder()
optimizer = torch.optim.Adam(model.parameters(), lr=0.005)
criterion = nn.MSELoss()

model.train()
for epoch in range(15):
    optimizer.zero_grad()
    outputs = model(tensor_seqs)
    loss = criterion(outputs, tensor_seqs)
    loss.backward()
    optimizer.step()
    if (epoch + 1) % 5 == 0:
        print(f"  [LSTM Epoch {epoch+1}/15] Loss: {loss.item():.5f}")

torch.save(model.state_dict(), "trained_models/lstm_autoencoder/lstm_ae.pth")
print("  [+] Saved PyTorch LSTM Autoencoder model weights to trained_models/lstm_autoencoder/")
print("[Train Script] ML Training complete!")
