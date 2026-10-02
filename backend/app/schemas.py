from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================
# Patient Schemas
# =========================

class PatientCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    age: int = Field(
        ge=0,
        le=120
    )

    gender: str | None = Field(
        default=None,
        max_length=20
    )

    heart_rate: float | None = Field(
        default=None,
        ge=20,
        le=250
    )

    systolic_bp: float | None = Field(
        default=None,
        ge=50,
        le=250
    )

    diastolic_bp: float | None = Field(
        default=None,
        ge=30,
        le=150
    )

    spo2: float | None = Field(
        default=None,
        ge=0,
        le=100
    )

    bmi: float | None = Field(
        default=None,
        ge=5,
        le=100
    )


class PatientResponse(PatientCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================
# Risk Prediction Schemas
# =========================

class RiskPredictionRequest(BaseModel):
    patient_id: int = Field(
        gt=0
    )

    age: float = Field(
        ge=1,
        le=120
    )

    sex: int = Field(
        ge=0,
        le=1
    )

    cp: int = Field(
        ge=1,
        le=4
    )

    trestbps: float = Field(
        gt=0
    )

    chol: float = Field(
        gt=0
    )

    fbs: int = Field(
        ge=0,
        le=1
    )

    restecg: int = Field(
        ge=0,
        le=2
    )

    thalach: float = Field(
        gt=0
    )

    exang: int = Field(
        ge=0,
        le=1
    )

    oldpeak: float = Field(
        ge=0
    )

    slope: int = Field(
        ge=1,
        le=3
    )

    ca: int = Field(
        ge=0,
        le=3
    )

    thal: int = Field(
        ge=3,
        le=7
    )


class RiskPredictionResponse(BaseModel):
    risk_probability: float
    risk_category: str


# =========================
# Anomaly Detection Schemas
# =========================

class AnomalyDetectionRequest(BaseModel):
    patient_id: int = Field(
        gt=0
    )


# =========================
# SHAP Explainability Schemas
# =========================

class ExplainRiskRequest(BaseModel):
    patient_id: int = Field(
        gt=0
    )

class ClinicLoginRequest(BaseModel):
    email: str
    password: str

class ClinicRegisterRequest(BaseModel):
    clinic_name: str = Field(min_length=2, max_length=150)
    administrator_name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=8, max_length=100)
    
class ClinicLoginResponse(BaseModel):
    access_token: str
    token_type: str
    clinic_id: int
    clinic_name: str
    administrator_name: str