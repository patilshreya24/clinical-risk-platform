from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, get_db
from .models import (
    Patient,
    RiskPrediction,
    RiskAssessment,
    AnomalyDetection
)

from backend.app.models import Clinic
from backend.app.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
)

from .schemas import (
    PatientCreate,
    PatientResponse,
    RiskPredictionRequest,
    AnomalyDetectionRequest,
    ExplainRiskRequest,
    ClinicLoginRequest,
    ClinicRegisterRequest
)

from .ml_service import predict_risk
from .anomaly_service import detect_anomaly
from .shap_service import explain_prediction


# =========================
# Authentication
# =========================

security = HTTPBearer()


def get_current_clinic(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],
        )

        clinic_id = payload.get("sub")

        if clinic_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
            )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
        )

    clinic = (
        db.query(Clinic)
        .filter(Clinic.id == int(clinic_id))
        .first()
    )

    if clinic is None:
        raise HTTPException(
            status_code=401,
            detail="Clinic not found",
        )

    return clinic


# =========================
# Create Database Tables
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# FastAPI Application
# =========================

app = FastAPI(
    title="Clinical Risk Intelligence Platform",
    description=(
        "Backend API for patient risk analysis "
        "and clinical decision support."
    ),
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Root Endpoint
# =========================

@app.get("/")
def root():
    return {
        "message": (
            "Clinical Risk Intelligence Platform "
            "API is running"
        )
    }


# =========================
# Patient Endpoints
# =========================

@app.post(
    "/patients",
    response_model=PatientResponse
)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    new_patient = Patient(
        **patient.model_dump()
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@app.get(
    "/patients",
    response_model=list[PatientResponse]
)
def get_patients(
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    return (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .all()
    )


@app.get(
    "/patients/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


# =========================
# Risk Prediction
# =========================

@app.post("/predict-risk")
def predict_patient_risk(
    patient: RiskPredictionRequest,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    # -------------------------
    # Check patient
    # -------------------------

    existing_patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient.patient_id
        )
        .first()
    )

    if not existing_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -------------------------
    # Prepare ML features
    # -------------------------

    prediction_data = patient.model_dump()

    prediction_data.pop("patient_id")

    # -------------------------
    # Run prediction
    # -------------------------

    result = predict_risk(
        prediction_data
    )

    # -------------------------
    # Save prediction
    # -------------------------

    prediction = RiskPrediction(
        patient_id=patient.patient_id,
        risk_probability=result[
            "risk_probability"
        ],
        risk_category=result[
            "risk_category"
        ],
        model_name=(
            "Tuned Logistic Regression"
        )
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # -------------------------
    # Save exact assessment
    # -------------------------

    assessment = RiskAssessment(
        patient_id=patient.patient_id,
        prediction_id=prediction.id,

        age=patient.age,
        sex=patient.sex,
        cp=patient.cp,
        trestbps=patient.trestbps,
        chol=patient.chol,
        fbs=patient.fbs,
        restecg=patient.restecg,
        thalach=patient.thalach,
        exang=patient.exang,
        oldpeak=patient.oldpeak,
        slope=patient.slope,
        ca=patient.ca,
        thal=patient.thal
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "id": prediction.id,
        "patient_id": prediction.patient_id,
        "risk_probability": (
            prediction.risk_probability
        ),
        "risk_category": (
            prediction.risk_category
        ),
        "model_name": prediction.model_name,
        "assessment_id": assessment.id,
        "created_at": prediction.created_at
    }


# =========================
# Risk Prediction History
# =========================

@app.get("/risk-predictions")
def get_risk_predictions(
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    return (
        db.query(RiskPrediction)
        .order_by(
            RiskPrediction.created_at.desc()
        )
        .all()
    )


@app.get(
    "/patients/{patient_id}/risk-predictions"
)
def get_patient_risk_predictions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return (
        db.query(RiskPrediction)
        .filter(
            RiskPrediction.patient_id == patient_id
        )
        .order_by(
            RiskPrediction.created_at.desc()
        )
        .all()
    )


# =========================
# Latest Risk Assessment
# =========================

@app.get(
    "/patients/{patient_id}/risk-assessment"
)
def get_latest_risk_assessment(
    patient_id: int,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    assessment = (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.patient_id == patient_id
        )
        .order_by(
            RiskAssessment.created_at.desc()
        )
        .first()
    )

    if not assessment:
        return {
            "assessment": None,
            "message": (
                "No cardiovascular risk assessment "
                "has been performed for this patient."
            )
        }

    prediction = None

    if assessment.prediction_id:
        prediction = (
            db.query(RiskPrediction)
            .filter(
                RiskPrediction.id ==
                assessment.prediction_id
            )
            .first()
        )

    return {
        "assessment": {
            "id": assessment.id,
            "patient_id": assessment.patient_id,
            "prediction_id": assessment.prediction_id,
            "age": assessment.age,
            "sex": assessment.sex,
            "cp": assessment.cp,
            "trestbps": assessment.trestbps,
            "chol": assessment.chol,
            "fbs": assessment.fbs,
            "restecg": assessment.restecg,
            "thalach": assessment.thalach,
            "exang": assessment.exang,
            "oldpeak": assessment.oldpeak,
            "slope": assessment.slope,
            "ca": assessment.ca,
            "thal": assessment.thal,
            "created_at": assessment.created_at
        },
        "prediction": (
            {
                "id": prediction.id,
                "risk_probability": (
                    prediction.risk_probability
                ),
                "risk_category": (
                    prediction.risk_category
                ),
                "model_name": prediction.model_name,
                "created_at": prediction.created_at
            }
            if prediction
            else None
        )
    }


# =========================
# Anomaly Detection
# =========================

@app.post("/detect-anomaly")
def detect_patient_anomaly(
    request: AnomalyDetectionRequest,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == request.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    patient_data = {
        "age": patient.age,
        "heart_rate": patient.heart_rate,
        "systolic_bp": patient.systolic_bp,
        "diastolic_bp": patient.diastolic_bp,
        "spo2": patient.spo2,
        "bmi": patient.bmi
    }

    missing_features = [
        feature
        for feature, value
        in patient_data.items()
        if value is None
    ]

    if missing_features:
        raise HTTPException(
            status_code=400,
            detail=(
                "Patient is missing required "
                "anomaly features: "
                + ", ".join(missing_features)
            )
        )

    result = detect_anomaly(
        patient_data
    )

    anomaly = AnomalyDetection(
        patient_id=patient.id,
        anomaly_score=result[
            "anomaly_score"
        ],
        is_anomaly=result[
            "is_anomaly"
        ]
    )

    db.add(anomaly)
    db.commit()
    db.refresh(anomaly)

    return {
        "id": anomaly.id,
        "patient_id": anomaly.patient_id,
        "anomaly_score": (
            anomaly.anomaly_score
        ),
        "is_anomaly": (
            anomaly.is_anomaly
        ),
        "created_at": anomaly.created_at
    }


@app.get(
    "/patients/{patient_id}/anomalies"
)
def get_patient_anomalies(
    patient_id: int,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return (
        db.query(AnomalyDetection)
        .filter(
            AnomalyDetection.patient_id ==
            patient_id
        )
        .order_by(
            AnomalyDetection.created_at.desc()
        )
        .all()
    )


# =========================
# SHAP Explainability
# =========================

@app.post("/explain-risk")
def explain_patient_risk(
    request: ExplainRiskRequest,
    db: Session = Depends(get_db),
    current_clinic: Clinic = Depends(get_current_clinic),
):
    # -------------------------
    # Check patient
    # -------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == request.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -------------------------
    # Get latest assessment
    # -------------------------

    assessment = (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.patient_id ==
            request.patient_id
        )
        .order_by(
            RiskAssessment.created_at.desc()
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail=(
                "No cardiovascular risk assessment "
                "exists for this patient. "
                "Run a risk assessment first."
            )
        )

    # -------------------------
    # Use EXACT assessment data
    # -------------------------

    patient_data = {
        "age": assessment.age,
        "sex": assessment.sex,
        "cp": assessment.cp,
        "trestbps": assessment.trestbps,
        "chol": assessment.chol,
        "fbs": assessment.fbs,
        "restecg": assessment.restecg,
        "thalach": assessment.thalach,
        "exang": assessment.exang,
        "oldpeak": assessment.oldpeak,
        "slope": assessment.slope,
        "ca": assessment.ca,
        "thal": assessment.thal
    }

    # -------------------------
    # Generate SHAP explanation
    # -------------------------

    explanations = explain_prediction(
        patient_data
    )

    return {
        "patient_id": patient.id,
        "assessment_id": assessment.id,
        "explanations": explanations
    }


# =========================
# Clinic Login
# =========================

@app.post("/clinic/login")
def clinic_login(
    login_data: ClinicLoginRequest,
    db: Session = Depends(get_db),
):
    clinic = (
        db.query(Clinic)
        .filter(Clinic.email == login_data.email)
        .first()
    )

    if not clinic:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        login_data.password,
        clinic.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "sub": str(clinic.id),
        "email": clinic.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "clinic_id": clinic.id,
        "clinic_name": clinic.clinic_name,
        "administrator_name": clinic.administrator_name,
    }


# =========================
# Clinic Registration
# =========================

@app.post("/clinic/register")
def register_clinic(
    registration_data: ClinicRegisterRequest,
    db: Session = Depends(get_db),
):
    existing_clinic = (
        db.query(Clinic)
        .filter(Clinic.email == registration_data.email)
        .first()
    )

    if existing_clinic:
        raise HTTPException(
            status_code=400,
            detail="A clinic with this email already exists.",
        )

    clinic = Clinic(
        clinic_name=registration_data.clinic_name,
        email=registration_data.email,
        password_hash=hash_password(
            registration_data.password
        ),
        administrator_name=registration_data.administrator_name,
    )

    db.add(clinic)
    db.commit()
    db.refresh(clinic)

    return {
        "message": "Clinic registered successfully",
        "clinic_id": clinic.id,
        "clinic_name": clinic.clinic_name,
        "administrator_name": clinic.administrator_name,
        "email": clinic.email,
    }


# =========================
# Demo Clinic
# =========================

@app.post("/clinic/create-demo")
def create_demo_clinic(
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Clinic)
        .filter(
            Clinic.email == "admin@clinicalai.com"
        )
        .first()
    )

    if existing:
        return {
            "message": "Demo clinic already exists"
        }

    clinic = Clinic(
        clinic_name="ClinicalAI Demo Clinic",
        email="admin@clinicalai.com",
        password_hash=hash_password(
            "ClinicalAI@123"
        ),
        administrator_name="Clinical Admin",
    )

    db.add(clinic)
    db.commit()
    db.refresh(clinic)

    return {
        "message": "Demo clinic created",
        "email": clinic.email,
    }