import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "heart_disease_clean.csv"
MODEL_DIR = BASE_DIR / "models"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading cleaned dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")


# --------------------------------------------------
# SEPARATE FEATURES AND TARGET
# --------------------------------------------------

X = df.drop("target", axis=1)
y = df["target"]

print(f"\nNumber of features: {X.shape[1]}")
print(f"Number of samples: {X.shape[0]}")


# --------------------------------------------------
# TRAIN / TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nData split completed.")

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# --------------------------------------------------
# CREATE MODEL DIRECTORY
# --------------------------------------------------

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 1. LOGISTIC REGRESSION
# --------------------------------------------------

print("\nTraining Logistic Regression...")

logistic_model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "model",
        LogisticRegression(
            max_iter=1000,
            random_state=42
        )
    )
])

logistic_model.fit(X_train, y_train)

joblib.dump(
    logistic_model,
    MODEL_DIR / "logistic_regression.pkl"
)

print("Logistic Regression trained and saved.")


# --------------------------------------------------
# 2. RANDOM FOREST
# --------------------------------------------------

print("\nTraining Random Forest...")

random_forest_model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)

random_forest_model.fit(X_train, y_train)

joblib.dump(
    random_forest_model,
    MODEL_DIR / "random_forest.pkl"
)

print("Random Forest trained and saved.")


# --------------------------------------------------
# 3. XGBOOST
# --------------------------------------------------

print("\nTraining XGBoost...")

xgboost_model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42
)

xgboost_model.fit(X_train, y_train)

joblib.dump(
    xgboost_model,
    MODEL_DIR / "xgboost.pkl"
)

print("XGBoost trained and saved.")


# --------------------------------------------------
# COMPLETE
# --------------------------------------------------

print("\n" + "=" * 50)
print("✅ MODEL TRAINING COMPLETE!")
print("=" * 50)

print("\nModels saved in:")
print(MODEL_DIR)