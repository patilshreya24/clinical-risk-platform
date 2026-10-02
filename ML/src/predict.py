import pandas as pd
from pathlib import Path
import joblib


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "logistic_regression_tuned.pkl"
)


# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# PREDICTION FUNCTION
# --------------------------------------------------

def predict_risk(patient_data):

    # Convert patient data into DataFrame
    patient_df = pd.DataFrame([patient_data])

    # Get probability of class 1
    probability = model.predict_proba(patient_df)[0][1]

    # Convert to percentage
    risk_score = probability * 100

    # Determine risk category
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


# --------------------------------------------------
# TEST PREDICTION
# --------------------------------------------------

if __name__ == "__main__":

    sample_patient = {
        "age": 52,
        "sex": 1,
        "cp": 3,
        "trestbps": 150,
        "chol": 250,
        "fbs": 0,
        "restecg": 1,
        "thalach": 140,
        "exang": 1,
        "oldpeak": 2.0,
        "slope": 2,
        "ca": 0,
        "thal": 6
    }

    result = predict_risk(sample_patient)

    print("\nPrediction Result")
    print("------------------------")
    print(
        f"Risk probability: "
        f"{result['risk_probability']}%"
    )
    print(
        f"Risk category: "
        f"{result['risk_category']}"
    )