import { useEffect, useState } from "react";
import {
  Brain,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

import { getRiskPredictions, explainPatientRisk } from "../api";

function Explainability() {
  const [predictions, setPredictions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [explanation, setExplanation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    try {
      setLoading(true);
      setError("");

      const data = await getRiskPredictions();
      setPredictions(data);

      if (data.length > 0) {
        const firstPatient = data.find(
          (item) => item.patient_id !== null
        );

        if (firstPatient) {
          setSelectedPatient(String(firstPatient.patient_id));
        }
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load risk assessments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain() {
    if (!selectedPatient) {
      setError("Please select a patient first.");
      return;
    }

    try {
      setExplaining(true);
      setError("");
      setExplanation(null);

      const data = await explainPatientRisk(
        Number(selectedPatient)
      );

      setExplanation(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to generate SHAP explanation."
      );
    } finally {
      setExplaining(false);
    }
  }

  const features = explanation?.explanations || [];

  const increasingRisk = features
    .filter((item) => item.shap_value > 0)
    .sort((a, b) => b.shap_value - a.shap_value);

  const decreasingRisk = features
    .filter((item) => item.shap_value < 0)
    .sort((a, b) => a.shap_value - b.shap_value);

  function formatFeatureName(feature) {
    const names = {
      age: "Age",
      sex: "Sex",
      cp: "Chest Pain Type",
      trestbps: "Resting Blood Pressure",
      chol: "Cholesterol",
      fbs: "Fasting Blood Sugar",
      restecg: "Resting ECG",
      thalach: "Maximum Heart Rate",
      exang: "Exercise-Induced Angina",
      oldpeak: "ST Depression",
      slope: "ST Segment Slope",
      ca: "Major Vessels",
      thal: "Thalassemia",
    };

    return names[feature] || feature;
  }

  function getMaxAbsValue() {
    if (features.length === 0) return 1;

    return Math.max(
      ...features.map((item) =>
        Math.abs(Number(item.shap_value))
      ),
      0.001
    );
  }

  function getBarWidth(value) {
    const maxValue = getMaxAbsValue();

    return `${Math.min(
      (Math.abs(Number(value)) / maxValue) * 100,
      100
    )}%`;
  }

  return (
    <div className="dashboard-content">
      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Explainability</h2>

          <p>
            Understand which assessment features contributed to
            the model's risk prediction.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadPredictions}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* INTRO PANEL */}
      <section className="panel explainability-intro">
        <div className="explainability-intro-icon">
          <Brain size={24} />
        </div>

        <div>
          <h3>SHAP-Based Model Explainability</h3>

          <p>
            SHAP values show how individual cardiovascular
            assessment features contributed to the model's
            prediction.
          </p>
        </div>
      </section>

      {/* PATIENT SELECTION */}
      <section className="panel explainability-selector">
        <div>
          <h3>Select Risk Assessment</h3>

          <p>
            Choose a patient with a stored cardiovascular risk
            assessment to view its feature contributions.
          </p>
        </div>

        <div className="explainability-controls">
          <div className="patient-search explainability-search">
            <Search size={17} />

            <select
              value={selectedPatient}
              onChange={(event) =>
                setSelectedPatient(event.target.value)
              }
            >
              <option value="">
                Select patient
              </option>

             {Object.values(
  predictions
    .filter((item) => item.patient_id !== null)
    .reduce((latest, prediction) => {
      const patientId = String(prediction.patient_id);

      if (
        !latest[patientId] ||
        new Date(prediction.created_at) >
          new Date(latest[patientId].created_at)
      ) {
        latest[patientId] = prediction;
      }

      return latest;
    }, {})
).map((prediction) => (
                  <option
                    key={prediction.id}
                    value={prediction.patient_id}
                  >
                    Patient #{prediction.patient_id} —{" "}
                    {Number(
                      prediction.risk_probability
                    ).toFixed(1)}
                    %
                  </option>
                ))}
            </select>
          </div>

          <button
            className="primary-btn"
            onClick={handleExplain}
            disabled={explaining || !selectedPatient}
          >
            <Brain size={16} />

            {explaining
              ? "Generating..."
              : "Explain Prediction"}
          </button>
        </div>
      </section>

      {loading && (
        <div className="loading-state">
          Loading risk assessments...
        </div>
      )}

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {/* EXPLANATION RESULTS */}
      {explanation && !error && (
        <>
          {/* SUMMARY */}
          <div className="patient-summary-grid explainability-summary">
            <div className="summary-card">
  <div className="summary-icon green">
    <TrendingDown size={20} />
  </div>

  <div>
    <span>Risk Probability</span>
    <strong>
      {Number(
        predictions.find(
          (item) =>
            String(item.patient_id) ===
            String(explanation.patient_id)
        )?.risk_probability ?? 0
      ).toFixed(1)}
      %
    </strong>
    
  </div>
</div>

            <div className="summary-card">
              <div className="summary-icon green">
                <TrendingDown size={20} />
              </div>

              <div>
                <span>Assessment</span>
                <strong>
                  #{explanation.assessment_id}
                </strong>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon orange">
                <Info size={20} />
              </div>

              <div>
                <span>Features Explained</span>
                <strong>{features.length}</strong>
              </div>
            </div>
          </div>

          {/* CONTRIBUTION PANELS */}
          <div className="explanation-grid">
            {/* INCREASES RISK */}
            <section className="panel contribution-panel">
              <div className="contribution-header">
                <div className="contribution-icon increase">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <h3>Increases Model Output</h3>
                  <p>
                    Features with positive SHAP contributions toward the model output.
                  </p>
                </div>
              </div>

              {increasingRisk.length === 0 ? (
                <div className="empty-state">
                  No positive contributions found.
                </div>
              ) : (
                <div className="shap-list">
                  {increasingRisk.map((item) => (
                    <div
                      className="shap-item"
                      key={item.feature}
                    >
                      <div className="shap-item-top">
  <div>
    <strong>
      {formatFeatureName(item.feature)}
    </strong>

    <small>
      Value: {item.value}
    </small>
  </div>

  <span className="shap-value increase">
    +{Number(item.shap_value).toFixed(4)}
  </span>
</div>

                      <div className="shap-bar-track">
                        <div
                          className="shap-bar increase"
                          style={{
                            width: getBarWidth(
                              item.shap_value
                            ),
                          }}
                        />
                      </div>

                      
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* DECREASES RISK */}
            <section className="panel contribution-panel">
              <div className="contribution-header">
                <div className="contribution-icon decrease">
                  <TrendingDown size={18} />
                </div>

                <div>
                  <h3>Decreases Model Output</h3>
                  <p>
                    Features with negative SHAP contributions away from the model output.
                  </p>
                </div>
              </div>

              {decreasingRisk.length === 0 ? (
                <div className="empty-state">
                  No negative contributions found.
                </div>
              ) : (
                <div className="shap-list">
                  {decreasingRisk.map((item) => (
                    <div
                      className="shap-item"
                      key={item.feature}
                    >
                      <div className="shap-item-top">
  <div>
    <strong>
      {formatFeatureName(item.feature)}
    </strong>

    <small>
      Value: {item.value}
    </small>
  </div>

  <span className="shap-value decrease">
    {Number(item.shap_value).toFixed(4)}
  </span>
</div>

                      <div className="shap-bar-track">
                        <div
                          className="shap-bar decrease"
                          style={{
                            width: getBarWidth(
                              item.shap_value
                            ),
                          }}
                        />
                      </div>

                      
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ALL FEATURES */}
          <section className="panel shap-table-panel">
            <div className="panel-header">
              <div>
                <h3>Feature Contributions</h3>

                <p>
                  Complete SHAP contribution breakdown for
                  this assessment.
                </p>
              </div>
            </div>

            <div className="shap-table">
              <div className="shap-table-row shap-table-heading">
                <span>Feature</span>
                <span>Value</span>
                <span>SHAP Value</span>
                <span>Direction</span>
              </div>

              {features.map((item) => (
                <div
                  className="shap-table-row"
                  key={item.feature}
                >
                  <strong>
                    {formatFeatureName(item.feature)}
                  </strong>

                  <span>{item.value}</span>

                  <span>
                    {Number(
                      item.shap_value
                    ).toFixed(4)}
                  </span>

                  <span
                    className={
                      item.shap_value > 0
                        ? "shap-direction increase"
                        : "shap-direction decrease"
                    }
                  >
                    {item.direction}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* DISCLAIMER */}
          <section className="panel explainability-disclaimer">
            <Info size={18} />

            <p>
              SHAP explanations describe how the trained
              machine-learning model responded to the supplied
              assessment features. They are model explanations,
              not medical diagnoses or clinical recommendations.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default Explainability;