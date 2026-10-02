import sys
from pathlib import Path

import joblib
import pandas as pd


# =========================
# Project paths
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ML"
    / "models"
    / "isolation_forest.pkl"
)


# =========================
# Database
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
# Load model
# =========================

model = joblib.load(
    MODEL_PATH
)


# =========================
# Load patients
# =========================

db = SessionLocal()

try:

    patients = (
        db.query(Patient)
        .order_by(Patient.id)
        .all()
    )

    data = []

    for patient in patients:

        data.append({
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "heart_rate": patient.heart_rate,
            "systolic_bp": patient.systolic_bp,
            "diastolic_bp": patient.diastolic_bp,
            "spo2": patient.spo2,
            "bmi": patient.bmi
        })

finally:

    db.close()


# =========================
# Create DataFrame
# =========================

df = pd.DataFrame(data)

X = df[FEATURES]


# =========================
# Predictions
# =========================

predictions = model.predict(X)

scores = model.decision_function(X)


df["anomaly_score"] = scores.round(4)

df["is_anomaly"] = predictions == -1


# =========================
# Display results
# =========================

print("\nANOMALY DETECTION RESULTS")
print("=" * 70)

print(
    df[
        [
            "id",
            "name",
            "anomaly_score",
            "is_anomaly"
        ]
    ].to_string(index=False)
)


print("\n" + "=" * 70)

print(
    f"Total patients: {len(df)}"
)

print(
    f"Anomalies detected: {df['is_anomaly'].sum()}"
)

print(
    f"Normal observations: "
    f"{(~df['is_anomaly']).sum()}"
)