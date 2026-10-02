import { useEffect, useState } from "react";
import { getPatients, createPatient } from "../api";
import {
  Search,
  Plus,
  Users,
  HeartPulse,
  Activity,
  X,
  ChevronRight,
} from "lucide-react";

function Patients({ onPatientSelect }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    heart_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    spo2: "",
    bmi: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load patients.");
    } finally {
      setLoading(false);
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
      setSaving(true);
      setError("");

      const patientData = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender || null,
        heart_rate:
          formData.heart_rate === ""
            ? null
            : Number(formData.heart_rate),
        systolic_bp:
          formData.systolic_bp === ""
            ? null
            : Number(formData.systolic_bp),
        diastolic_bp:
          formData.diastolic_bp === ""
            ? null
            : Number(formData.diastolic_bp),
        spo2:
          formData.spo2 === ""
            ? null
            : Number(formData.spo2),
        bmi:
          formData.bmi === ""
            ? null
            : Number(formData.bmi),
      };

      const newPatient = await createPatient(patientData);

      setPatients((previous) => [newPatient, ...previous]);

      setFormData({
        name: "",
        age: "",
        gender: "",
        heart_rate: "",
        systolic_bp: "",
        diastolic_bp: "",
        spo2: "",
        bmi: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create patient.");
    } finally {
      setSaving(false);
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h2>Patients</h2>
          <p>
            View and manage patient records stored in the database.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} />
          Add Patient
        </button>
      </div>

      <div className="patient-summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue">
            <Users size={20} />
          </div>

          <div>
            <span>Total Patients</span>
            <strong>{patients.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            <HeartPulse size={20} />
          </div>

          <div>
            <span>Records Loaded</span>
            <strong>{patients.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            <Activity size={20} />
          </div>

          <div>
            <span>Search Results</span>
            <strong>{filteredPatients.length}</strong>
          </div>
        </div>
      </div>

      <section className="panel patients-page-panel">
        <div className="patients-toolbar">
          <div>
            <h3>Patient Records</h3>
            <p>
              All patient information currently stored in PostgreSQL.
            </p>
          </div>

          <div className="patient-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            Loading patients...
          </div>
        )}

        {error && (
          <div className="error-state">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="full-patient-table">
            <div className="full-table-row full-table-heading">
              <span>Patient</span>
              <span>Age</span>
              <span>Gender</span>
              <span>Heart Rate</span>
              <span>Blood Pressure</span>
              <span>SpO₂</span>
              <span>BMI</span>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                No patients found.
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  className="full-table-row"
                  key={patient.id}
                  onClick={() => onPatientSelect(patient)}
                  style={{
                    cursor: "pointer",
                  }}
                  title="Open patient profile"
                >
                  <div className="patient-name">
                    <div className="patient-avatar">
                      {patient.name.charAt(0)}
                    </div>

                    <div>
                      <strong>{patient.name}</strong>
                      <small>ID #{patient.id}</small>
                    </div>
                  </div>

                  <span>{patient.age}</span>

                  <span>
                    {patient.gender || "—"}
                  </span>

                  <span>
                    {patient.heart_rate
                      ? `${patient.heart_rate} bpm`
                      : "—"}
                  </span>

                  <span>
                    {patient.systolic_bp &&
                    patient.diastolic_bp
                      ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                      : "—"}
                  </span>

                  <span>
                    {patient.spo2 !== null &&
                    patient.spo2 !== undefined
                      ? `${patient.spo2}%`
                      : "—"}
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    {patient.bmi !== null &&
                    patient.bmi !== undefined
                      ? patient.bmi
                      : "—"}

                    <ChevronRight
                      size={14}
                      style={{
                        color: "#9aa4b3",
                        flexShrink: 0,
                      }}
                    />
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="patient-modal">
            <div className="modal-header">
              <div>
                <h3>Add New Patient</h3>
                <p>
                  Enter the patient's basic information and vitals.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ananya Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    placeholder="e.g. 45"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Heart Rate (bpm)</label>

                  <input
                    type="number"
                    name="heart_rate"
                    value={formData.heart_rate}
                    onChange={handleChange}
                    min="20"
                    max="250"
                    placeholder="e.g. 78"
                  />
                </div>

                <div className="form-group">
                  <label>Systolic BP</label>

                  <input
                    type="number"
                    name="systolic_bp"
                    value={formData.systolic_bp}
                    onChange={handleChange}
                    min="50"
                    max="250"
                    placeholder="e.g. 120"
                  />
                </div>

                <div className="form-group">
                  <label>Diastolic BP</label>

                  <input
                    type="number"
                    name="diastolic_bp"
                    value={formData.diastolic_bp}
                    onChange={handleChange}
                    min="30"
                    max="150"
                    placeholder="e.g. 80"
                  />
                </div>

                <div className="form-group">
                  <label>SpO₂ (%)</label>

                  <input
                    type="number"
                    name="spo2"
                    value={formData.spo2}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="e.g. 98"
                  />
                </div>

                <div className="form-group">
                  <label>BMI</label>

                  <input
                    type="number"
                    name="bmi"
                    value={formData.bmi}
                    onChange={handleChange}
                    min="5"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 23.5"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;