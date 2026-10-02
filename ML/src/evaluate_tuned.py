import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "heart_disease_clean.csv"
MODEL_DIR = BASE_DIR / "models"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading cleaned dataset...")

df = pd.read_csv(DATA_PATH)

X = df.drop("target", axis=1)
y = df["target"]


# --------------------------------------------------
# SAME TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# --------------------------------------------------
# LOAD TUNED MODELS
# --------------------------------------------------

models = {
    "Tuned Logistic Regression":
        joblib.load(
            MODEL_DIR / "logistic_regression_tuned.pkl"
        ),

    "Tuned Random Forest":
        joblib.load(
            MODEL_DIR / "random_forest_tuned.pkl"
        ),

    "Tuned XGBoost":
        joblib.load(
            MODEL_DIR / "xgboost_tuned.pkl"
        )
}


# --------------------------------------------------
# EVALUATE
# --------------------------------------------------

results = []


for name, model in models.items():

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    y_pred = model.predict(X_test)

    y_probability = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        y_probability
    )

    cm = confusion_matrix(
        y_test,
        y_pred
    )

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    print("\nConfusion Matrix:")
    print(cm)

    results.append({
        "Model": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1": f1,
        "ROC-AUC": roc_auc
    })


# --------------------------------------------------
# COMPARISON
# --------------------------------------------------

results_df = pd.DataFrame(results)

print("\n" + "=" * 60)
print("TUNED MODEL COMPARISON")
print("=" * 60)

print(results_df.to_string(index=False))