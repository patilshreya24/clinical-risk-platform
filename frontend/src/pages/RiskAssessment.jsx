import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Activity,
  HeartPulse,
  Save,
  AlertTriangle,
} from "lucide-react";
import { getPatient, predictRisk } from "../api";

function RiskAssessment({ patientId, onBack }) {
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
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

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  async function loadPatient() {
    try {
      setLoadingPatient(true);
      setError("");

      const data = await getPatient(patientId);
      setPatient(data);

      setFormData((previous) => ({
        ...previous,
        age: data.age ?? "",
        trestbps: data.systolic_bp ?? "",
        sex:
          data.gender === "Male"
            ? "1"
            : data.gender === "Female"
            ? "0"
            : "",
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load patient information.");
    } finally {
      setLoadingPatient(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      const assessmentData = {
        patient_id: Number(patientId),
        age: Number(formData.age),
        sex: Number(formData.sex),
        cp: Number(formData.cp),
        trestbps: Number(formData.trestbps),
        chol: Number(formData.chol),
        fbs: Number(formData.fbs),
        restecg: Number(formData.restecg),
        thalach: Number(formData.thalach),
        exang: Number(formData.exang),
        oldpeak: Number(formData.oldpeak),
        slope: Number(formData.slope),
        ca: Number(formData.ca),
        thal: Number(formData.thal),
      };

      const prediction = await predictRisk(assessmentData);

      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError(err.message || "Risk prediction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPatient) {
    return (
      <div className="dashboard-content">
        <div className="loading-state">
          Loading patient information...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-content">
        <div className="error-state">
          Patient information could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* HEADER */}
      <div className="page-header-row">
        <div>
          <button className="secondary-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Patient
          </button>

          <div className="assessment-title">
            <div>
              <span className="section-eyebrow">
                CARDIOVASCULAR ASSESSMENT
              </span>

              <h2>Risk Assessment</h2>

              <p>
                Complete the cardiovascular assessment for{" "}
                <strong>{patient.name}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PATIENT SUMMARY */}
      <section className="panel assessment-patient-card">
        <div className="assessment-patient-icon">
          <HeartPulse size={24} />
        </div>

        <div>
          <span>Patient</span>
          <h3>{patient.name}</h3>
          <p>
            Patient ID #{patient.id} · Age {patient.age}
          </p>
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className="assessment-warning">
        <AlertTriangle size={18} />

        <div>
          <strong>Educational / Portfolio Assessment</strong>
          <p>
            This model is intended for demonstration and educational
            purposes. It is not a clinical diagnostic or treatment tool.
          </p>
        </div>
      </div>

      {/* FORM */}
      {!result && (
        <form onSubmit={handleSubmit}>
          <section className="panel assessment-form-panel">
            <div className="assessment-section-header">
              <div className="assessment-section-icon">
                <Activity size={20} />
              </div>

              <div>
                <h3>Cardiovascular Assessment Data</h3>
                <p>
                  Enter the features required by the trained risk model.
                </p>
              </div>
            </div>

            <div className="assessment-form-grid">
              {/* AGE */}
              <div className="form-group">
                <label>Age *</label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
              </div>

              {/* SEX */}
              <div className="form-group">
                <label>Sex *</label>

                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select sex</option>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>

              {/* CHEST PAIN */}
              <div className="form-group">
                <label>Chest Pain Type *</label>

                <select
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="1">
                    1 — Typical Angina
                  </option>
                  <option value="2">
                    2 — Atypical Angina
                  </option>
                  <option value="3">
                    3 — Non-anginal Pain
                  </option>
                  <option value="4">
                    4 — Asymptomatic
                  </option>
                </select>
              </div>

              {/* BLOOD PRESSURE */}
              <div className="form-group">
                <label>Resting Blood Pressure *</label>

                <input
                  type="number"
                  name="trestbps"
                  value={formData.trestbps}
                  onChange={handleChange}
                  min="50"
                  max="250"
                  required
                />

                <small>mmHg</small>
              </div>

              {/* CHOLESTEROL */}
              <div className="form-group">
                <label>Cholesterol *</label>

                <input
                  type="number"
                  name="chol"
                  value={formData.chol}
                  onChange={handleChange}
                  min="50"
                  max="700"
                  required
                />

                <small>mg/dL</small>
              </div>

              {/* FASTING BLOOD SUGAR */}
              <div className="form-group">
                <label>Fasting Blood Sugar *</label>

                <select
                  name="fbs"
                  value={formData.fbs}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="0">
                    0 — ≤ 120 mg/dL
                  </option>
                  <option value="1">
                    1 — &gt; 120 mg/dL
                  </option>
                </select>
              </div>

              {/* REST ECG */}
              <div className="form-group">
                <label>Resting ECG *</label>

                <select
                  name="restecg"
                  value={formData.restecg}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select result</option>
                  <option value="0">
                    0 — Normal
                  </option>
                  <option value="1">
                    1 — ST-T Wave Abnormality
                  </option>
                  <option value="2">
                    2 — LV Hypertrophy
                  </option>
                </select>
              </div>

              {/* MAX HEART RATE */}
              <div className="form-group">
                <label>Maximum Heart Rate *</label>

                <input
                  type="number"
                  name="thalach"
                  value={formData.thalach}
                  onChange={handleChange}
                  min="50"
                  max="250"
                  required
                />

                <small>bpm</small>
              </div>

              {/* EXERCISE ANGINA */}
              <div className="form-group">
                <label>Exercise-Induced Angina *</label>

                <select
                  name="exang"
                  value={formData.exang}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="0">0 — No</option>
                  <option value="1">1 — Yes</option>
                </select>
              </div>

              {/* OLDPEAK */}
              <div className="form-group">
                <label>ST Depression (Oldpeak) *</label>

                <input
                  type="number"
                  name="oldpeak"
                  value={formData.oldpeak}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.1"
                  required
                />
              </div>

              {/* SLOPE */}
              <div className="form-group">
                <label>ST Segment Slope *</label>

                <select
                  name="slope"
                  value={formData.slope}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select slope</option>
                  <option value="1">
                    1 — Upsloping
                  </option>
                  <option value="2">
                    2 — Flat
                  </option>
                  <option value="3">
                    3 — Downsloping
                  </option>
                </select>
              </div>

              {/* CA */}
              <div className="form-group">
                <label>Major Vessels (CA) *</label>

                <select
                  name="ca"
                  value={formData.ca}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              {/* THAL */}
              <div className="form-group">
                <label>Thalassemia *</label>

                <select
                  name="thal"
                  value={formData.thal}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="3">
                    3 — Normal
                  </option>
                  <option value="6">
                    6 — Fixed Defect
                  </option>
                  <option value="7">
                    7 — Reversible Defect
                  </option>
                </select>
              </div>
            </div>

            {error && (
              <div className="error-state assessment-error">
                {error}
              </div>
            )}

            <div className="assessment-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={onBack}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting}
              >
                <Save size={17} />

                {submitting
                  ? "Generating Risk Prediction..."
                  : "Generate Risk Prediction"}
              </button>
            </div>
          </section>
        </form>
      )}

      {/* RESULT */}
      {result && (
        <section className="panel risk-result-panel">
          <div className="risk-result-header">
            <div>
              <span className="section-eyebrow">
                ASSESSMENT COMPLETE
              </span>

              <h3>Risk Prediction Result</h3>

              <p>
                Assessment generated for {patient.name}.
              </p>
            </div>
          </div>

          <div className="risk-result-card">
            <div className="risk-result-score">
              <span>Risk Probability</span>

              <strong>
                {Number(result.risk_probability).toFixed(1)}%
              </strong>
            </div>

            <div className="risk-result-category">
              <span>Risk Category</span>

              <strong
                className={`risk-badge ${
                  result.risk_category === "Low"
                    ? "low"
                    : result.risk_category === "Moderate"
                    ? "moderate"
                    : "elevated"
                }`}
              >
                {result.risk_category}
              </strong>
            </div>
          </div>

          <div className="assessment-result-note">
            <AlertTriangle size={18} />

            <p>
              This result is generated by the project's trained machine
              learning model and is intended for educational and portfolio
              demonstration purposes only.
            </p>
          </div>

          <div className="assessment-actions">
            <button
              className="secondary-btn"
              onClick={onBack}
            >
              <ArrowLeft size={16} />
              Back to Patient Profile
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default RiskAssessment;