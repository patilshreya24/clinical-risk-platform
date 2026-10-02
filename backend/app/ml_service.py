import sys
from pathlib import Path
import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ML"
    / "models"
    / "logistic_regression_tuned.pkl"
)

model = joblib.load(MODEL_PATH)


def predict_risk(patient_data):
    patient_df = pd.DataFrame([patient_data])

    probability = model.predict_proba(patient_df)[0][1]

    risk_score = probability * 100

    if risk_score < 30:
        risk_category = "Low"
    elif risk_score < 60:
        risk_category = "Moderate"
    else:
        risk_category = "Elevated"

    return {
        "risk_probability": round(risk_score, 2),
        "risk_category": risk_category
    }