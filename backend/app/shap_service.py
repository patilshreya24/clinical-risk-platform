import joblib
import pandas as pd
import shap

from pathlib import Path


# =========================
# Paths
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ML"
    / "models"
    / "logistic_regression_tuned.pkl"
)

DATA_PATH = (
    PROJECT_ROOT
    / "ML"
    / "data"
    / "heart_disease_clean.csv"
)


# =========================
# Feature names
# =========================

FEATURES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]


# =========================
# Load model
# =========================

model = joblib.load(MODEL_PATH)


# =========================
# Prepare SHAP background
# =========================

data = pd.read_csv(DATA_PATH)

X = data[FEATURES]

scaler = model.steps[0][1]
logistic_model = model.steps[1][1]

X_scaled = scaler.transform(X)


# =========================
# Create SHAP explainer
# =========================

explainer = shap.LinearExplainer(
    logistic_model,
    X_scaled
)


# =========================
# Explain prediction
# =========================

def explain_prediction(patient_data):

    patient_df = pd.DataFrame(
        [patient_data],
        columns=FEATURES
    )

    patient_scaled = scaler.transform(patient_df)

    shap_values = explainer.shap_values(patient_scaled)

    shap_values = shap_values[0]

    explanations = []

    for feature, value, shap_value in zip(
        FEATURES,
        patient_df.iloc[0],
        shap_values
    ):

        explanations.append({
            "feature": feature,
            "value": float(value),
            "shap_value": round(float(shap_value), 4),
            "direction": (
                "increases risk"
                if shap_value > 0
                else "decreases risk"
            )
        })

    explanations.sort(
        key=lambda x: abs(x["shap_value"]),
        reverse=True
    )

    return explanations