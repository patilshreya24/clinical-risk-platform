# Clinical Risk Intelligence Platform

A full-stack clinical decision support and patient risk intelligence platform that combines machine learning, anomaly detection, and explainable AI to support healthcare data analysis.

> **Disclaimer:** This project is developed for educational and portfolio purposes. It is not intended to provide medical diagnosis or treatment recommendations.

## Features

- Clinic registration and secure login
- JWT-based authentication
- Patient management
- Cardiovascular risk prediction
- Machine learning model comparison
- Tuned Logistic Regression risk model
- Random Forest and XGBoost comparison
- Risk probability and risk categorization
- Patient risk history
- Anomaly detection using Isolation Forest
- SHAP-based model explainability
- Patient-specific risk assessment
- Model performance dashboard
- Interactive React dashboard
- PostgreSQL database integration
- RESTful FastAPI backend

## Machine Learning

The platform evaluates multiple machine learning models:

- Logistic Regression
- Random Forest
- XGBoost

The selected tuned Logistic Regression model achieved the following evaluation results on the held-out test set:

| Metric | Score |
|---|---:|
| Accuracy | 86.67% |
| Precision | 91.67% |
| Recall | 78.57% |
| F1 Score | 84.62% |
| ROC-AUC | 95.09% |

### Anomaly Detection

Isolation Forest is used to identify unusual patient profiles based on:

- Age
- Heart rate
- Systolic blood pressure
- Diastolic blood pressure
- SpO2
- BMI

### Explainability

SHAP is used to show how individual input features contribute to the model's risk prediction.

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database

- PostgreSQL

### Machine Learning

- NumPy
- Pandas
- Scikit-learn
- XGBoost
- SHAP

### Tools

- Git
- GitHub
- VS Code

## Project Structure

```text
clinical-risk-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── auth_service.py
│   │   ├── ml_service.py
│   │   ├── anomaly_service.py
│   │   └── shap_service.py
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api.js
│       └── App.jsx
│
├── ML/
│   ├── model training
│   ├── evaluation
│   └── analysis
│
├── .gitignore
└── README.md