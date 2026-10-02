import joblib
import pandas as pd

from pathlib import Path
from sklearn.ensemble import IsolationForest


# =========================
# Configuration
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "ML" / "models"

MODEL_PATH = MODEL_DIR / "isolation_forest.pkl"


# Features used for anomaly detection
FEATURES = [
    "age",
    "heart_rate",
    "systolic_bp",
    "diastolic_bp",
    "spo2",
    "bmi"
]


# =========================
# Train Isolation Forest
# =========================

def train_anomaly_model(patient_data):

    df = pd.DataFrame(patient_data)

    X = df[FEATURES]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,
        random_state=42
    )

    model.fit(X)

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_PATH
    )

    return model


# =========================
# Predict Anomaly
# =========================

def detect_anomaly(patient_data):

    patient_df = pd.DataFrame(
        [patient_data]
    )

    model = joblib.load(
        MODEL_PATH
    )

    score = model.decision_function(
        patient_df[FEATURES]
    )[0]

    prediction = model.predict(
        patient_df[FEATURES]
    )[0]

    is_anomaly = prediction == -1

    return {
        "anomaly_score": round(
            float(score),
            4
        ),
        "is_anomaly": is_anomaly
    }