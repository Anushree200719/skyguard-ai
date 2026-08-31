import os

class Settings:
    PROJECT_NAME: str = "SkyGuard AI ML Core"
    VERSION: str = "1.0.0"
    MODEL_DIR: str = os.getenv("MODEL_DIR", "trained_models")
    ISOLATION_FOREST_PATH: str = os.path.join(MODEL_DIR, "isolation_forest/iso_forest.pkl")
    SCALER_PATH: str = os.path.join(MODEL_DIR, "isolation_forest/scaler.pkl")
    LSTM_MODEL_PATH: str = os.path.join(MODEL_DIR, "lstm_autoencoder/lstm_ae.pth")
    SEQUENCE_LENGTH: int = 24

settings = Settings()
