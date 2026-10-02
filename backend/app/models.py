from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean
)

from .database import Base


# =========================
# Patient
# =========================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=True)

    heart_rate = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# Risk Prediction
# =========================

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True
    )

    risk_probability = Column(
        Float,
        nullable=False
    )

    risk_category = Column(
        String,
        nullable=False
    )

    model_name = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# Cardiovascular Assessment
# =========================

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    prediction_id = Column(
        Integer,
        ForeignKey("risk_predictions.id"),
        nullable=True
    )

    age = Column(
        Float,
        nullable=False
    )

    sex = Column(
        Integer,
        nullable=False
    )

    cp = Column(
        Integer,
        nullable=False
    )

    trestbps = Column(
        Float,
        nullable=False
    )

    chol = Column(
        Float,
        nullable=False
    )

    fbs = Column(
        Integer,
        nullable=False
    )

    restecg = Column(
        Integer,
        nullable=False
    )

    thalach = Column(
        Float,
        nullable=False
    )

    exang = Column(
        Integer,
        nullable=False
    )

    oldpeak = Column(
        Float,
        nullable=False
    )

    slope = Column(
        Integer,
        nullable=False
    )

    ca = Column(
        Integer,
        nullable=False
    )

    thal = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================
# Anomaly Detection
# =========================

class AnomalyDetection(Base):
    __tablename__ = "anomaly_detections"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    anomaly_score = Column(
        Float,
        nullable=False
    )

    is_anomaly = Column(
        Boolean,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    clinic_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    administrator_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)