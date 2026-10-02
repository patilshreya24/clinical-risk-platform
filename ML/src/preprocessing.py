import pandas as pd
from pathlib import Path


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

RAW_DATA_PATH = DATA_DIR / "heart_disease_raw.csv"
CLEAN_DATA_PATH = DATA_DIR / "heart_disease_clean.csv"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

def load_data():
    df = pd.read_csv(RAW_DATA_PATH)

    return df


# --------------------------------------------------
# CLEAN DATA
# --------------------------------------------------

def clean_data(df):

    print("\nStarting data cleaning...")

    # Convert columns containing missing values to numeric
    df["ca"] = pd.to_numeric(df["ca"], errors="coerce")
    df["thal"] = pd.to_numeric(df["thal"], errors="coerce")

    # Check duplicates
    duplicates = df.duplicated().sum()

    print(f"Duplicate rows found: {duplicates}")

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Check missing values
    print("\nMissing values before cleaning:")
    print(df.isnull().sum())

    # Remove rows with missing values
    df = df.dropna()

    # Convert target into binary classification
    # 0 = No heart disease
    # 1,2,3,4 = Heart disease
    df["target"] = (df["target"] > 0).astype(int)

    print("\nMissing values after cleaning:")
    print(df.isnull().sum())

    print("\nNew target distribution:")
    print(df["target"].value_counts())

    return df


# --------------------------------------------------
# SAVE CLEAN DATA
# --------------------------------------------------

def save_clean_data(df):

    df.to_csv(CLEAN_DATA_PATH, index=False)

    print("\nClean dataset saved to:")
    print(CLEAN_DATA_PATH)


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    print("Loading raw dataset...")

    df = load_data()

    print(f"Original dataset shape: {df.shape}")

    df = clean_data(df)

    print(f"\nClean dataset shape: {df.shape}")

    save_clean_data(df)

    print("\n✅ PREPROCESSING COMPLETE!")