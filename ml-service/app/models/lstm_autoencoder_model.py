import os
import numpy as np
import torch
import torch.nn as nn
from app.core.config import settings

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

class LSTMAutoencoderWrapper:
    def __init__(self):
        self.model = PyTorchLSTMAutoencoder()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.load_or_init()

    def load_or_init(self):
        if os.path.exists(settings.LSTM_MODEL_PATH):
            try:
                state_dict = torch.load(settings.LSTM_MODEL_PATH, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model.eval()
                print("[LSTMAutoencoderWrapper] Successfully loaded trained PyTorch LSTM weights.")
                return
            except Exception as e:
                print(f"[LSTMAutoencoderWrapper] Could not load saved LSTM weights: {e}")
        
        self.model.eval()
        print("[LSTMAutoencoderWrapper] Initialized base PyTorch LSTM Autoencoder.")

    def predict_sequence(self, sequence: list) -> dict:
        """
        Sequence expected: list of 24 dicts with keys ['temperature', 'humidity', 'pressure']
        """
        if not sequence or len(sequence) < 5:
            return {"reconstruction_error": 0.05, "anomaly_score": 0.1, "is_anomaly": False}

        # Normalize features roughly around weather baseline
        arr = np.array([[obs.get('temperature', 30.0), obs.get('humidity', 60.0), obs.get('pressure', 1013.25)] for obs in sequence])
        
        # Simple z-score normalization
        mean = np.array([30.0, 60.0, 1013.25])
        std = np.array([5.0, 15.0, 10.0])
        norm_arr = (arr - mean) / std

        # Handle shorter sequence padded to 24
        if len(norm_arr) < settings.SEQUENCE_LENGTH:
            padding = np.tile(norm_arr[-1:], (settings.SEQUENCE_LENGTH - len(norm_arr), 1))
            norm_arr = np.vstack([norm_arr, padding])
        else:
            norm_arr = norm_arr[-settings.SEQUENCE_LENGTH:]

        tensor_in = torch.tensor(norm_arr, dtype=torch.float32).unsqueeze(0).to(self.device)

        with torch.no_grad():
            reconstructed = self.model(tensor_in)
            loss = nn.MSELoss()(reconstructed, tensor_in).item()

        # Scale loss to anomaly score (0..1)
        anomaly_score = float(np.clip(loss * 2.0, 0.0, 1.0))
        is_anomaly = anomaly_score > 0.45

        return {
            "reconstruction_error": round(float(loss), 5),
            "anomaly_score": round(anomaly_score, 4),
            "is_anomaly": is_anomaly
        }

lstm_ae = LSTMAutoencoderWrapper()
