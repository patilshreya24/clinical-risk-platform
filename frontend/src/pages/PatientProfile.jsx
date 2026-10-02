import { useEffect, useState } from "react";

import {
  ArrowLeft,
  User,
  Calendar,
  HeartPulse,
  Activity,
  Droplets,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Brain,
  ClipboardCheck,
  LoaderCircle,
  CheckCircle2,
  X,
  Play,
} from "lucide-react";

import {
  detectPatientAnomaly,
  predictRisk,
  getLatestRiskAssessment,
  explainPatientRisk,
} from "../api";


function PatientProfile({
  patient,
  onBack,
  onStartRiskAssessment,
}) {
  // =========================================================
  // ANOMALY STATE
  // =========================================================

  const [anomalyResult, setAnomalyResult] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(true);
  const [anomalyError, setAnomalyError] = useState("");


  // =========================================================
  // RISK ASSESSMENT STATE
  // =========================================================

  const [showRiskForm, setShowRiskForm] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState("");
  const [riskResult, setRiskResult] = useState(null);
  const [existingAssessment, setExistingAssessment] = useState(null);


  // =========================================================
  // SHAP STATE
  // =========================================================

  const [explanation, setExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");


  // =========================================================
  // RISK FORM
  // =========================================================

  const getInitialSex = () => {
    if (!patient.gender) {
      return "";
    }

    const gender = patient.gender.toLowerCase();

    if (gender === "male") {
      return "1";
    }

    if (gender === "female") {
      return "0";
    }

    return "";
  };


  const getInitialTrestbps = () => {
    if (
      patient.systolic_bp !== null &&
      patient.systolic_bp !== undefined
    ) {
      return String(patient.systolic_bp);
    }

    return "";
  };


  const [formData, setFormData] = useState({
    age: String(patient.age ?? ""),
    sex: getInitialSex(),
    cp: "",
    trestbps: getInitialTrestbps(),
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
  });


  // =========================================================
  // LOAD ANOMALY + EXISTING RISK ASSESSMENT
  // =========================================================

  useEffect(() => {
    analyzePatient();
    loadExistingAssessment();

    setFormData({
      age: String(patient.age ?? ""),
      sex: getInitialSex(),
      cp: "",
      trestbps: getInitialTrestbps(),
      chol: "",
      fbs: "",
      restecg: "",
      thalach: "",
      exang: "",
      oldpeak: "",
      slope: "",
      ca: "",
      thal: "",
    });

    setRiskResult(null);
    setExplanation(null);
    setRiskError("");
    setExplanationError("");
  }, [patient.id]);


  async function analyzePatient() {
    try {
      setAnomalyLoading(true);
      setAnomalyError("");
      setAnomalyResult(null);

      const result = await detectPatientAnomaly(
        patient.id
      );

      setAnomalyResult(result);
    } catch (error) {
      console.error(error);

      setAnomalyError(
        error.message ||
          "Unable to analyze patient."
      );
    } finally {
      setAnomalyLoading(false);
    }
  }


  async function loadExistingAssessment() {
    try {
      const result =
        await getLatestRiskAssessment(patient.id);

      setExistingAssessment(result);
    } catch (error) {
      console.error(error);
      setExistingAssessment(null);
    }
  }


  // =========================================================
  // FORM HANDLING
  // =========================================================

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  function openRiskForm() {
    setRiskError("");
    setShowRiskForm(true);
  }


  function closeRiskForm() {
    if (!riskLoading) {
      setShowRiskForm(false);
      setRiskError("");
    }
  }


  // =========================================================
  // RUN RISK ASSESSMENT
  // =========================================================

  async function handleRiskAssessment(event) {
    event.preventDefault();

    setRiskError("");
    setRiskResult(null);
    setRiskLoading(true);

    try {
      const requiredFields = [
        "age",
        "sex",
        "cp",
        "trestbps",
        "chol",
        "fbs",
        "restecg",
        "thalach",
        "exang",
        "oldpeak",
        "slope",
        "ca",
        "thal",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          formData[field] === "" ||
          formData[field] === null ||
          formData[field] === undefined
      );

      if (missingFields.length > 0) {
        throw new Error(
          "Please complete all cardiovascular assessment fields."
        );
      }


      const predictionData = {
        patient_id: patient.id,

        age: Number(formData.age),

        sex: Number(formData.sex),

        cp: Number(formData.cp),

        trestbps: Number(
          formData.trestbps
        ),

        chol: Number(
          formData.chol
        ),

        fbs: Number(
          formData.fbs
        ),

        restecg: Number(
          formData.restecg
        ),

        thalach: Number(
          formData.thalach
        ),

        exang: Number(
          formData.exang
        ),

        oldpeak: Number(
          formData.oldpeak
        ),

        slope: Number(
          formData.slope
        ),

        ca: Number(
          formData.ca
        ),

        thal: Number(
          formData.thal
        ),
      };


      const result =
        await predictRisk(predictionData);

      setRiskResult(result);

      setShowRiskForm(false);

      setExistingAssessment(
        await getLatestRiskAssessment(
          patient.id
        )
      );

    } catch (error) {
      console.error(error);

      setRiskError(
        error.message ||
          "Unable to generate risk assessment."
      );
    } finally {
      setRiskLoading(false);
    }
  }


  // =========================================================
  // SHAP EXPLANATION
  // =========================================================

  async function handleExplainRisk() {
    try {
      setExplanationLoading(true);
      setExplanationError("");

      const result =
        await explainPatientRisk(
          patient.id
        );

      setExplanation(result);
    } catch (error) {
      console.error(error);

      setExplanationError(
        error.message ||
          "Unable to generate explanation."
      );
    } finally {
      setExplanationLoading(false);
    }
  }


  // =========================================================
  // DISPLAY VALUES
  // =========================================================

  const bloodPressure =
    patient.systolic_bp !== null &&
    patient.systolic_bp !== undefined &&
    patient.diastolic_bp !== null &&
    patient.diastolic_bp !== undefined
      ? `${patient.systolic_bp}/${patient.diastolic_bp}`
      : "—";


  const displayedRisk =
  riskResult || existingAssessment;

const riskData =
  displayedRisk?.prediction || displayedRisk;

const riskProbability =
  riskData?.risk_probability !== null &&
  riskData?.risk_probability !== undefined
    ? Number(riskData.risk_probability)
    : null;


  const riskColor =
    displayedRisk?.risk_category === "Elevated"
      ? "#dc2626"
      : displayedRisk?.risk_category === "Moderate"
      ? "#d97706"
      : "#15803d";


  const riskBackground =
    displayedRisk?.risk_category === "Elevated"
      ? "#fff0f0"
      : displayedRisk?.risk_category === "Moderate"
      ? "#fff6e7"
      : "#eafaf0";


  return (
    <div className="dashboard-content">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        className="secondary-btn"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft size={15} />
        Back to Patients
      </button>


      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginBottom: "20px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >

            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#eaf2ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              {patient.name.charAt(0)}
            </div>


            <div>

              <div
                style={{
                  color: "#7b8799",
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "5px",
                }}
              >
                PATIENT PROFILE
              </div>

              <h2
                style={{
                  color: "#172033",
                  fontSize: "21px",
                  marginBottom: "5px",
                }}
              >
                {patient.name}
              </h2>

              <p
                style={{
                  color: "#8a95a6",
                  fontSize: "11px",
                }}
              >
                Patient ID #{patient.id}
              </p>

            </div>

          </div>


          <div
            style={{
              padding: "8px 12px",
              background: "#eafaf0",
              color: "#15803d",
              borderRadius: "20px",
              fontSize: "9px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={13} />
            Profile Active
          </div>

        </div>
      </section>


      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginBottom: "20px",
        }}
      >

        <div className="panel-header">
          <div>
            <h3>Patient Information</h3>

            <p>
              Basic demographic information
            </p>
          </div>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "14px",
          }}
        >

          <InfoCard
            icon={<User size={17} />}
            label="Gender"
            value={
              patient.gender ||
              "Not recorded"
            }
          />

          <InfoCard
            icon={<Calendar size={17} />}
            label="Age"
            value={`${patient.age} years`}
          />

          <InfoCard
            icon={<ClipboardCheck size={17} />}
            label="Patient ID"
            value={`#${patient.id}`}
          />

        </div>

      </section>


      {/* =====================================================
          LATEST VITALS
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginBottom: "20px",
        }}
      >

        <div className="panel-header">

          <div>
            <h3>Latest Vitals</h3>

            <p>
              Most recently recorded patient
              measurements
            </p>
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "14px",
          }}
        >

          <VitalCard
            icon={<HeartPulse size={18} />}
            iconBackground="#fff0f0"
            iconColor="#dc2626"
            label="Heart Rate"
            value={
              patient.heart_rate !== null &&
              patient.heart_rate !== undefined
                ? `${patient.heart_rate} bpm`
                : "—"
            }
          />


          <VitalCard
            icon={<Activity size={18} />}
            iconBackground="#eaf2ff"
            iconColor="#2563eb"
            label="Blood Pressure"
            value={bloodPressure}
          />


          <VitalCard
            icon={<Droplets size={18} />}
            iconBackground="#eafaf0"
            iconColor="#16a34a"
            label="SpO₂"
            value={
              patient.spo2 !== null &&
              patient.spo2 !== undefined
                ? `${patient.spo2}%`
                : "—"
            }
          />


          <VitalCard
            icon={<Scale size={18} />}
            iconBackground="#fff6e7"
            iconColor="#d97706"
            label="BMI"
            value={
              patient.bmi !== null &&
              patient.bmi !== undefined
                ? patient.bmi
                : "—"
            }
          />

        </div>

      </section>


      {/* =====================================================
          ANALYSIS CARDS
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "16px",
        }}
      >


        {/* ===================================================
            ANOMALY ANALYSIS
        =================================================== */}

        <section className="panel">

          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background:
                anomalyResult?.is_anomaly
                  ? "#fff0f0"
                  : "#fff6e7",
              color:
                anomalyResult?.is_anomaly
                  ? "#dc2626"
                  : "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <AlertTriangle size={19} />
          </div>


          <h3
            style={{
              color: "#202b3e",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Anomaly Analysis
          </h3>


          <p
            style={{
              color: "#8a95a6",
              fontSize: "10px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Detect unusual combinations of patient
            vital measurements using the Isolation
            Forest model.
          </p>


          {anomalyLoading && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#f8fafc",
                color: "#7b8798",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >

              <LoaderCircle
                size={14}
                style={{
                  animation:
                    "spin 1s linear infinite",
                }}
              />

              Analyzing patient...

            </div>
          )}


          {!anomalyLoading &&
            anomalyError && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#fff0f0",
                  border:
                    "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "10px",
                  lineHeight: "1.5",
                }}
              >
                {anomalyError}
              </div>
            )}


          {!anomalyLoading &&
            !anomalyError &&
            anomalyResult && (
              <div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background:
                      anomalyResult.is_anomaly
                        ? "#fff0f0"
                        : "#eafaf0",
                    color:
                      anomalyResult.is_anomaly
                        ? "#b91c1c"
                        : "#15803d",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    marginBottom: "10px",
                  }}
                >

                  {anomalyResult.is_anomaly ? (
                    <AlertTriangle size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}

                  {anomalyResult.is_anomaly
                    ? "Anomaly detected"
                    : "No anomaly detected"}

                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding: "9px 2px",
                  }}
                >

                  <span
                    style={{
                      color: "#8a95a6",
                      fontSize: "9px",
                    }}
                  >
                    Anomaly Score
                  </span>


                  <strong
                    style={{
                      color: "#344055",
                      fontSize: "11px",
                    }}
                  >
                    {typeof anomalyResult.anomaly_score ===
                    "number"
                      ? anomalyResult.anomaly_score.toFixed(
                          4
                        )
                      : "—"}
                  </strong>

                </div>


                <p
                  style={{
                    color: "#9aa4b3",
                    fontSize: "8px",
                    lineHeight: "1.5",
                    marginTop: "5px",
                  }}
                >
                  This score indicates how unusual
                  the patient's recorded vital
                  measurements are relative to the
                  model's reference data. It is not
                  a medical risk score.
                </p>

              </div>
            )}

        </section>


        {/* ===================================================
            RISK ASSESSMENT
        =================================================== */}

        <section className="panel">

          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#eaf2ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <ShieldCheck size={19} />
          </div>


          <h3
            style={{
              color: "#202b3e",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Risk Assessment
          </h3>


          <p
            style={{
              color: "#8a95a6",
              fontSize: "10px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Cardiovascular risk assessment using
            the project's trained machine learning
            model.
          </p>


          {/* RISK RESULT */}

          {displayedRisk ? (
            <div>

              <div
                style={{
                  padding: "13px",
                  borderRadius: "9px",
                  background: riskBackground,
                  color: riskColor,
                  marginBottom: "12px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Risk Category
                  </span>

                  <strong
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    {riskData?.risk_category ||
  riskData?.category ||
  "Unknown"}
                  </strong>

                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >

                  <span
                    style={{
                      fontSize: "9px",
                    }}
                  >
                    Risk Probability
                  </span>

                  <strong
                    style={{
                      fontSize: "18px",
                    }}
                  >
                    {riskProbability !== null &&
Number.isFinite(riskProbability)
  ? `${riskProbability.toFixed(1)}%`
  : "—"}
                  </strong>

                </div>

              </div>


              <div
                style={{
                  fontSize: "8px",
                  color: "#9aa4b3",
                  lineHeight: "1.5",
                  marginBottom: "12px",
                }}
              >
                Model:{" "}
                {riskData?.model_name ||
                  "Tuned Logistic Regression"}
              </div>


              <button
                type="button"
                className="primary-btn"
                onClick={openRiskForm}
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                Run New Assessment
              </button>

            </div>
          ) : (

            <div>

              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  color: "#7b8798",
                  fontSize: "10px",
                  lineHeight: "1.5",
                  marginBottom: "12px",
                }}
              >
                Complete a cardiovascular assessment
                containing the required model features
                to generate a patient-specific risk
                prediction.
              </div>


              {existingAssessment && (
                <div
                  style={{
                    padding: "9px",
                    borderRadius: "7px",
                    background: "#f0f7ff",
                    color: "#2563eb",
                    fontSize: "9px",
                    marginBottom: "10px",
                  }}
                >
                  A previous assessment exists for
                  this patient.
                </div>
              )}


              <button
                type="button"
                className="primary-btn"
                onClick={() => onStartRiskAssessment(patient)}
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Play size={14} />
                Start Risk Assessment
              </button>

            </div>
          )}

        </section>


        {/* ===================================================
            EXPLAINABILITY
        =================================================== */}

        <section className="panel">

          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#f3edff",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <Brain size={19} />
          </div>


          <h3
            style={{
              color: "#202b3e",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Explainability
          </h3>


          <p
            style={{
              color: "#8a95a6",
              fontSize: "10px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            SHAP explanations show how individual
            assessment features contribute to the
            model prediction.
          </p>


          {riskResult || existingAssessment ? (

            <div>

              <button
                type="button"
                className="primary-btn"
                onClick={handleExplainRisk}
                disabled={explanationLoading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >

                {explanationLoading ? (
                  <>
                    <LoaderCircle
                      size={14}
                      style={{
                        animation:
                          "spin 1s linear infinite",
                      }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain size={14} />
                    Explain This Prediction
                  </>
                )}

              </button>


              {explanationError && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "7px",
                    background: "#fff0f0",
                    border:
                      "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "9px",
                    lineHeight: "1.5",
                  }}
                >
                  {explanationError}
                </div>
              )}


              {explanation && (
  <div
    style={{
      marginTop: "10px",
      padding: "12px",
      borderRadius: "9px",
      background: "#f8fafc",
      border: "1px solid #eef1f5",
    }}
  >
    <strong
      style={{
        display: "block",
        color: "#202b3e",
        fontSize: "10px",
        marginBottom: "4px",
      }}
    >
      SHAP Explanation
    </strong>

    <p
      style={{
        margin: "0 0 10px",
        color: "#8a95a6",
        fontSize: "8px",
        lineHeight: "1.5",
      }}
    >
      How individual assessment features influenced
      the model prediction.
    </p>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        maxHeight: "170px",
        overflowY: "auto",
        paddingRight: "3px",
      }}
    >
      {(explanation.explanations || [])
        .slice()
        .sort(
          (a, b) =>
            Math.abs(b.shap_value) -
            Math.abs(a.shap_value)
        )
        .map((item, index) => {
          const featureNames = {
            age: "Age",
            sex: "Sex",
            cp: "Chest Pain Type",
            trestbps: "Resting Blood Pressure",
            chol: "Cholesterol",
            fbs: "Fasting Blood Sugar",
            restecg: "Resting ECG",
            thalach: "Maximum Heart Rate",
            exang: "Exercise Angina",
            oldpeak: "ST Depression",
            slope: "ST Slope",
            ca: "Major Vessels",
            thal: "Thalassemia",
          };

          const increasesRisk =
            item.direction === "increases risk";

          return (
            <div
              key={`${item.feature}-${index}`}
              style={{
                padding: "8px",
                borderRadius: "7px",
                background: "#ffffff",
                border: "1px solid #eef1f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    color: "#202b3e",
                    fontSize: "8px",
                    fontWeight: 600,
                  }}
                >
                  {featureNames[item.feature] ||
                    item.feature}
                </span>

                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: increasesRisk
                      ? "#dc2626"
                      : "#059669",
                  }}
                >
                  {increasesRisk ? "↑" : "↓"}{" "}
                  {Math.abs(item.shap_value).toFixed(3)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#8a95a6",
                    fontSize: "7px",
                  }}
                >
                  Value: {item.value}
                </span>

                <span
                  style={{
                    color: increasesRisk
                      ? "#dc2626"
                      : "#059669",
                    fontSize: "7px",
                  }}
                >
                  {item.direction}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}

            </div>

          ) : (

            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#f8fafc",
                color: "#7b8798",
                fontSize: "10px",
                lineHeight: "1.5",
              }}
            >
              No cardiovascular risk assessment
is available for this patient yet.
            </div>

          )}

        </section>

      </div>


      {/* =====================================================
          DISCLAIMER
      ===================================================== */}

      <div
        className="disclaimer"
        style={{
          marginTop: "20px",
        }}
      >

        <AlertTriangle size={14} />

        <span>
          This platform is an educational/portfolio
          clinical decision-support prototype.
          Anomaly detection and model predictions
          are not medical diagnoses and should not
          replace professional medical judgment.
        </span>

      </div>


      {/* =====================================================
          RISK ASSESSMENT MODAL
      ===================================================== */}

      {showRiskForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "min(820px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 20px 60px rgba(15,23,42,0.25)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding: "20px 24px",
                borderBottom:
                  "1px solid #eef1f5",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
              }}
            >

              <div>

                <div
                  style={{
                    color: "#7b8799",
                    fontSize: "9px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    marginBottom: "5px",
                  }}
                >
                  CARDIOVASCULAR ASSESSMENT
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "#172033",
                    fontSize: "18px",
                  }}
                >
                  Risk Assessment — {patient.name}
                </h3>

                <p
                  style={{
                    marginTop: "5px",
                    color: "#8a95a6",
                    fontSize: "10px",
                  }}
                >
                  Enter the assessment features
                  required by the trained model.
                </p>

              </div>


              <button
                type="button"
                onClick={closeRiskForm}
                disabled={riskLoading}
                style={{
                  width: "34px",
                  height: "34px",
                  border: "1px solid #e5eaf0",
                  background: "#ffffff",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: riskLoading
                    ? "not-allowed"
                    : "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleRiskAssessment}
              style={{
                padding: "24px",
              }}
            >

              <div
                style={{
                  padding: "11px 13px",
                  borderRadius: "8px",
                  background: "#f0f7ff",
                  border:
                    "1px solid #dbeafe",
                  color: "#47627f",
                  fontSize: "9px",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                }}
              >
                Age, sex, and resting blood pressure
                are pre-filled from the patient's
                profile where available. The remaining
                values must come from a cardiovascular
                assessment.
              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >

                {/* AGE */}

                <FormField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleFormChange}
                  min="1"
                  max="120"
                  required
                  helper="Patient age in years"
                />


                {/* SEX */}

                <FormSelect
                  label="Sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select sex
                  </option>
                  <option value="0">
                    Female
                  </option>
                  <option value="1">
                    Male
                  </option>
                </FormSelect>


                {/* CHEST PAIN */}

                <FormSelect
                  label="Chest Pain Type"
                  name="cp"
                  value={formData.cp}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select type
                  </option>
                  <option value="1">
                    Typical angina
                  </option>
                  <option value="2">
                    Atypical angina
                  </option>
                  <option value="3">
                    Non-anginal pain
                  </option>
                  <option value="4">
                    Asymptomatic
                  </option>
                </FormSelect>


                {/* RESTING BP */}

                <FormField
                  label="Resting Blood Pressure"
                  name="trestbps"
                  type="number"
                  value={formData.trestbps}
                  onChange={handleFormChange}
                  min="1"
                  required
                  helper="mmHg"
                />


                {/* CHOLESTEROL */}

                <FormField
                  label="Cholesterol"
                  name="chol"
                  type="number"
                  value={formData.chol}
                  onChange={handleFormChange}
                  min="1"
                  required
                  helper="mg/dL"
                />


                {/* FASTING BLOOD SUGAR */}

                <FormSelect
                  label="Fasting Blood Sugar > 120 mg/dL"
                  name="fbs"
                  value={formData.fbs}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select
                  </option>
                  <option value="0">
                    No
                  </option>
                  <option value="1">
                    Yes
                  </option>
                </FormSelect>


                {/* REST ECG */}

                <FormSelect
                  label="Resting ECG"
                  name="restecg"
                  value={formData.restecg}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select result
                  </option>
                  <option value="0">
                    Normal
                  </option>
                  <option value="1">
                    ST-T wave abnormality
                  </option>
                  <option value="2">
                    Left ventricular hypertrophy
                  </option>
                </FormSelect>


                {/* MAX HEART RATE */}

                <FormField
                  label="Maximum Heart Rate"
                  name="thalach"
                  type="number"
                  value={formData.thalach}
                  onChange={handleFormChange}
                  min="1"
                  required
                  helper="Maximum heart rate achieved"
                />


                {/* EXERCISE ANGINA */}

                <FormSelect
                  label="Exercise-Induced Angina"
                  name="exang"
                  value={formData.exang}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select
                  </option>
                  <option value="0">
                    No
                  </option>
                  <option value="1">
                    Yes
                  </option>
                </FormSelect>


                {/* OLDPEAK */}

                <FormField
                  label="ST Depression (Oldpeak)"
                  name="oldpeak"
                  type="number"
                  value={formData.oldpeak}
                  onChange={handleFormChange}
                  min="0"
                  step="0.1"
                  required
                  helper="Exercise-induced ST depression"
                />


                {/* SLOPE */}

                <FormSelect
                  label="ST Segment Slope"
                  name="slope"
                  value={formData.slope}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select slope
                  </option>
                  <option value="1">
                    Upsloping
                  </option>
                  <option value="2">
                    Flat
                  </option>
                  <option value="3">
                    Downsloping
                  </option>
                </FormSelect>


                {/* CA */}

                <FormSelect
                  label="Major Vessels (CA)"
                  name="ca"
                  value={formData.ca}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select number
                  </option>
                  <option value="0">
                    0
                  </option>
                  <option value="1">
                    1
                  </option>
                  <option value="2">
                    2
                  </option>
                  <option value="3">
                    3
                  </option>
                </FormSelect>


                {/* THAL */}

                <FormSelect
                  label="Thalassemia (Thal)"
                  name="thal"
                  value={formData.thal}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select result
                  </option>
                  <option value="3">
                    Normal
                  </option>
                  <option value="6">
                    Fixed defect
                  </option>
                  <option value="7">
                    Reversible defect
                  </option>
                </FormSelect>

              </div>


              {/* ERROR */}

              {riskError && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "11px 13px",
                    borderRadius: "8px",
                    background: "#fff0f0",
                    border:
                      "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "10px",
                    lineHeight: "1.5",
                  }}
                >
                  {riskError}
                </div>
              )}


              {/* MODAL ACTIONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "22px",
                  paddingTop: "18px",
                  borderTop:
                    "1px solid #eef1f5",
                }}
              >

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeRiskForm}
                  disabled={riskLoading}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-btn"
                  disabled={riskLoading}
                >

                  {riskLoading ? (
                    <>
                      <LoaderCircle
                        size={15}
                        style={{
                          animation:
                            "spin 1s linear infinite",
                        }}
                      />
                      Running Assessment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Run Risk Assessment
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .risk-assessment-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

    </div>
  );
}


/* =========================================================
   FORM INPUT
========================================================= */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  min,
  max,
  step,
  required,
  helper,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#344055",
          fontSize: "10px",
          fontWeight: "600",
          marginBottom: "6px",
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: "#dc2626",
              marginLeft: "3px",
            }}
          >
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        required={required}
        style={{
          width: "100%",
          height: "40px",
          border:
            "1px solid #dfe5ec",
          borderRadius: "8px",
          padding: "0 11px",
          color: "#172033",
          background: "#ffffff",
          fontSize: "11px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {helper && (
        <span
          style={{
            display: "block",
            marginTop: "4px",
            color: "#9aa4b3",
            fontSize: "8px",
          }}
        >
          {helper}
        </span>
      )}
    </div>
  );
}


/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  required,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#344055",
          fontSize: "10px",
          fontWeight: "600",
          marginBottom: "6px",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#dc2626",
              marginLeft: "3px",
            }}
          >
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%",
          height: "40px",
          border:
            "1px solid #dfe5ec",
          borderRadius: "8px",
          padding: "0 10px",
          color:
            value
              ? "#172033"
              : "#9aa4b3",
          background: "#ffffff",
          fontSize: "11px",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        {children}
      </select>
    </div>
  );
}


/* =========================================================
   INFORMATION CARD
========================================================= */

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "14px",
        border:
          "1px solid #eef1f5",
        borderRadius: "9px",
        background: "#fafbfd",
        display: "flex",
        alignItems: "center",
        gap: "11px",
      }}
    >

      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "8px",
          background: "#eaf2ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>


      <div>

        <span
          style={{
            display: "block",
            color: "#8a95a6",
            fontSize: "9px",
            marginBottom: "3px",
          }}
        >
          {label}
        </span>


        <strong
          style={{
            color: "#344055",
            fontSize: "11px",
          }}
        >
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   VITAL CARD
========================================================= */

function VitalCard({
  icon,
  iconBackground,
  iconColor,
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "16px",
        border:
          "1px solid #e6eaf0",
        borderRadius: "10px",
        background: "#ffffff",
      }}
    >

      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "9px",
          background: iconBackground,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>


      <span
        style={{
          display: "block",
          color: "#8a95a6",
          fontSize: "9px",
          marginBottom: "4px",
        }}
      >
        {label}
      </span>


      <strong
        style={{
          display: "block",
          color: "#172033",
          fontSize: "17px",
        }}
      >
        {value}
      </strong>

    </div>
  );
}


export default PatientProfile;