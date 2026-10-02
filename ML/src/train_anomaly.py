import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest


# =========================
# Project paths
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "ML" / "models"
MODEL_PATH = MODEL_DIR / "isolation_forest.pkl"


# =========================
# Database import
# =========================

sys.path.append(
    str(PROJECT_ROOT)
)

from backend.app.database import SessionLocal
from backend.app.models import Patient


# =========================
# Features
# =========================

FEATURES = [
    "age",
    "heart_rate",
    "systolic_bp",
    "diastolic_bp",
    "spo2",
    "bmi"
]


# =========================
# Load patients
# =========================

def load_patient_data():

    db = SessionLocal()

    try:
        patients = db.query(Patient).all()

        data = []

        for patient in patients:

            data.append({
                "age": patient.age,
                "heart_rate": patient.heart_rate,
                "systolic_bp": patient.systolic_bp,
                "diastolic_bp": patient.diastolic_bp,
                "spo2": patient.spo2,
                "bmi": patient.bmi
            })

        return pd.DataFrame(data)

    finally:
        db.close()


# =========================
# Train model
# =========================

def train_model(df):

    X = df[FEATURES]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,
        random_state=42
    )

    model.fit(X)

    return model


# =========================
# Main
# =========================

if __name__ == "__main__":

    print("\nLoading patients from database...")

    df = load_patient_data()

    print(
        f"Patients loaded: {len(df)}"
    )

    print("\nFeatures used:")

    for feature in FEATURES:
        print(f"- {feature}")

    print("\nTraining Isolation Forest...")

    model = train_model(df)

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_PATH
    )

    print("\nIsolation Forest training complete!")

    print("\nModel saved to:")

    print(MODEL_PATH)