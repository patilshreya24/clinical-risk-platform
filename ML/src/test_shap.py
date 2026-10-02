import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

sys.path.append(str(PROJECT_ROOT))

from backend.app.shap_service import explain_prediction


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


results = explain_prediction(sample_patient)


print("\nSHAP Explanation")
print("========================")

for item in results:
    print(
        f"{item['feature']:10} "
        f"value={item['value']:6.2f} "
        f"SHAP={item['shap_value']:8.4f} "
        f"-> {item['direction']}"
    )