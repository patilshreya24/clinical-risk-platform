import { useEffect, useState } from "react";
import { getPatients, getRiskPredictions } from "../api";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";

function Dashboard() {
    const [patients, setPatients] = useState([]);
const [riskPredictions, setRiskPredictions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);

      const [patientData, riskData] = await Promise.all([
        getPatients(),
        getRiskPredictions(),
      ]);

      setPatients(patientData);
      setRiskPredictions(riskData);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  loadDashboardData();
}, []);

 const totalPatients = patients.length;

const lowRisk = riskPredictions.filter(
  (item) => item.risk_category === "Low"
).length;

const moderateRisk = riskPredictions.filter(
  (item) => item.risk_category === "Moderate"
).length;

const elevatedRisk = riskPredictions.filter(
  (item) => item.risk_category === "Elevated"
).length;

const totalAssessments = riskPredictions.length;

const lowPercentage =
  totalAssessments > 0
    ? ((lowRisk / totalAssessments) * 100).toFixed(1)
    : "0.0";

const moderatePercentage =
  totalAssessments > 0
    ? ((moderateRisk / totalAssessments) * 100).toFixed(1)
    : "0.0";

const elevatedPercentage =
  totalAssessments > 0
    ? ((elevatedRisk / totalAssessments) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-state">
          Loading clinical dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-state">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="welcome-row">
        <div>
          <h2>Good evening</h2>
          <p>
            Here's an overview of your patient risk intelligence system.
          </p>
        </div>

        <div className="last-updated">
          Last updated <strong>Just now</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={22} />
          </div>

          <div>
            <span>Total Patients</span>
            <h3>{totalPatients}</h3>
            <small>
  {totalAssessments} risk assessments
</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Low Risk</span>
            <h3>{lowRisk}</h3>
           <small className="positive">
  {lowPercentage}% of assessments
</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Activity size={22} />
          </div>

          <div>
            <span>Moderate Risk</span>
            <h3>{moderateRisk}</h3>
            <small>
  {moderatePercentage}% of assessments
</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Elevated Risk</span>
            <h3>{elevatedRisk}</h3>
            <small className="warning">
  {elevatedPercentage}% of assessments
</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel risk-overview">
          <div className="panel-header">
            <div>
              <h3>Risk Distribution</h3>
              <p>Current patient risk categories</p>
            </div>
          </div>

         <div className="risk-bars">
  <div className="risk-bar-item">
    <div>
      <span>Low Risk</span>
      <strong>{lowPercentage}%</strong>
    </div>
    <div className="bar">
      <div
        className="bar-fill low"
        style={{ width: `${lowPercentage}%` }}
      />
    </div>
  </div>

  <div className="risk-bar-item">
    <div>
      <span>Moderate Risk</span>
      <strong>{moderatePercentage}%</strong>
    </div>
    <div className="bar">
      <div
        className="bar-fill moderate"
        style={{ width: `${moderatePercentage}%` }}
      />
    </div>
  </div>

  <div className="risk-bar-item">
    <div>
      <span>Elevated Risk</span>
      <strong>{elevatedPercentage}%</strong>
    </div>
    <div className="bar">
      <div
        className="bar-fill elevated"
        style={{ width: `${elevatedPercentage}%` }}
      />
    </div>
  </div>
</div> 
        </section>

        <section className="panel system-panel">
          <div className="panel-header">
            <div>
              <h3>System Status</h3>
              <p>ML services and infrastructure</p>
            </div>
          </div>

          <div className="service-row">
            <span className="service-dot online"></span>
            <div>
              <strong>FastAPI Backend</strong>
              <small>Operational</small>
            </div>
            <span className="service-status">Online</span>
          </div>

          <div className="service-row">
            <span className="service-dot online"></span>
            <div>
              <strong>Risk Prediction Model</strong>
              <small>Logistic Regression</small>
            </div>
            <span className="service-status">Online</span>
          </div>

          <div className="service-row">
            <span className="service-dot online"></span>
            <div>
              <strong>Anomaly Detection</strong>
              <small>Isolation Forest</small>
            </div>
            <span className="service-status">Online</span>
          </div>

          <div className="service-row">
            <span className="service-dot online"></span>
            <div>
              <strong>Explainability</strong>
              <small>SHAP</small>
            </div>
            <span className="service-status">Online</span>
          </div>
        </section>
      </div>

      <section className="panel patients-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Patients</h3>
            <p>Latest patient records from the database</p>
          </div>

          <button className="view-all-btn">View all patients →</button>
        </div>

        <div className="patient-table">
  <div className="table-row table-heading">
    <span>Patient</span>
    <span>Age</span>
    <span>Gender</span>
    <span>Heart Rate</span>
    <span>Blood Pressure</span>
  </div>

  {patients.slice(0, 5).map((patient) => (
    <div className="table-row" key={patient.id}>
      <div className="patient-name">
        <div className="patient-avatar">
          {patient.name.charAt(0)}
        </div>
        <strong>{patient.name}</strong>
      </div>

      <span>{patient.age}</span>

      <span>{patient.gender || "—"}</span>

      <span>
        {patient.heart_rate
          ? `${patient.heart_rate} bpm`
          : "—"}
      </span>

      <span>
        {patient.systolic_bp && patient.diastolic_bp
          ? `${patient.systolic_bp}/${patient.diastolic_bp}`
          : "—"}
      </span>
    </div>
  ))}
</div>
      </section>

      <div className="disclaimer">
        <AlertTriangle size={16} />
        <span>
          <strong>Educational / Portfolio Project:</strong> Risk predictions
          shown by this platform are for demonstration purposes only and are
          not intended for clinical diagnosis or treatment decisions.
        </span>
      </div>
    </div>
  );
}

export default Dashboard;