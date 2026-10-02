import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "heart_disease_clean.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading cleaned dataset...")

df = pd.read_csv(DATA_PATH)

X = df.drop("target", axis=1)
y = df["target"]

print(f"Dataset shape: {df.shape}")


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


# --------------------------------------------------
# 1. LOGISTIC REGRESSION
# --------------------------------------------------

print("\n" + "=" * 60)
print("Tuning Logistic Regression")
print("=" * 60)

logistic_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", LogisticRegression(
        max_iter=1000,
        random_state=42
    ))
])

logistic_params = {
    "model__C": [0.01, 0.1, 1, 10, 100]
}

logistic_grid = GridSearchCV(
    logistic_pipeline,
    logistic_params,
    cv=5,
    scoring="roc_auc",
    n_jobs=-1
)

logistic_grid.fit(X_train, y_train)

print("Best parameters:")
print(logistic_grid.best_params_)

print(f"Best CV ROC-AUC: {logistic_grid.best_score_:.4f}")

joblib.dump(
    logistic_grid.best_estimator_,
    MODEL_DIR / "logistic_regression_tuned.pkl"
)


# --------------------------------------------------
# 2. RANDOM FOREST
# --------------------------------------------------

print("\n" + "=" * 60)
print("Tuning Random Forest")
print("=" * 60)

random_forest = RandomForestClassifier(
    random_state=42,
    class_weight="balanced"
)

rf_params = {
    "n_estimators": [100, 200],
    "max_depth": [None, 5, 10],
    "min_samples_split": [2, 5]
}

rf_grid = GridSearchCV(
    random_forest,
    rf_params,
    cv=5,
    scoring="roc_auc",
    n_jobs=-1
)

rf_grid.fit(X_train, y_train)

print("Best parameters:")
print(rf_grid.best_params_)

print(f"Best CV ROC-AUC: {rf_grid.best_score_:.4f}")

joblib.dump(
    rf_grid.best_estimator_,
    MODEL_DIR / "random_forest_tuned.pkl"
)


# --------------------------------------------------
# 3. XGBOOST
# --------------------------------------------------

print("\n" + "=" * 60)
print("Tuning XGBoost")
print("=" * 60)

xgb_model = XGBClassifier(
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42
)

xgb_params = {
    "n_estimators": [100, 200],
    "max_depth": [3, 4],
    "learning_rate": [0.03, 0.05, 0.1]
}

xgb_grid = GridSearchCV(
    xgb_model,
    xgb_params,
    cv=5,
    scoring="roc_auc",
    n_jobs=-1
)

xgb_grid.fit(X_train, y_train)

print("Best parameters:")
print(xgb_grid.best_params_)

print(f"Best CV ROC-AUC: {xgb_grid.best_score_:.4f}")

joblib.dump(
    xgb_grid.best_estimator_,
    MODEL_DIR / "xgboost_tuned.pkl"
)


# --------------------------------------------------
# COMPLETE
# --------------------------------------------------

print("\n" + "=" * 60)
print("✅ HYPERPARAMETER TUNING COMPLETE!")
print("=" * 60)

print("\nTuned models saved in:")
print(MODEL_DIR)