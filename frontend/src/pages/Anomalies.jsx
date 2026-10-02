import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Search,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  getPatients,
  getPatientAnomalies,
  detectAnomaly,
} from "../api";


function Anomalies() {
  const [patients, setPatients] = useState([]);
  const [anomalyData, setAnomalyData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [detectingPatient, setDetectingPatient] =
    useState(null);

  const [error, setError] = useState("");


  // =========================
  // Load anomaly information
  // =========================

  useEffect(() => {
    loadAnomalyData();
  }, []);


  async function loadAnomalyData() {
    try {
      setLoading(true);
      setError("");

      const patientData = await getPatients();

      setPatients(patientData);

      const results = await Promise.all(
        patientData.map(async (patient) => {
          try {
            const anomalies =
              await getPatientAnomalies(patient.id);

            return {
              patientId: patient.id,
              anomalies,
            };
          } catch (err) {
            console.error(
              `Failed to load anomalies for patient ${patient.id}`,
              err
            );

            return {
              patientId: patient.id,
              anomalies: [],
            };
          }
        })
      );


      const anomalyMap = {};

      results.forEach((item) => {
        anomalyMap[item.patientId] =
          item.anomalies;
      });

      setAnomalyData(anomalyMap);

    } catch (err) {
      console.error(err);
      setError(
        "Unable to load anomaly information."
      );
    } finally {
      setLoading(false);
    }
  }


  // =========================
  // Run anomaly detection
  // =========================

  async function handleDetect(patientId) {
    try {
      setDetectingPatient(patientId);
      setError("");

      await detectAnomaly(patientId);

      const updatedHistory =
        await getPatientAnomalies(patientId);

      setAnomalyData((previous) => ({
        ...previous,
        [patientId]: updatedHistory,
      }));

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to run anomaly detection."
      );
    } finally {
      setDetectingPatient(null);
    }
  }


  // =========================
  // Get latest result
  // =========================

  function getLatestResult(patientId) {
    const history =
      anomalyData[patientId] || [];

    if (history.length === 0) {
      return null;
    }

    return history[0];
  }


  // =========================
  // Search
  // =========================

  const filteredPatients =
    patients.filter((patient) =>
      patient.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );


  // =========================
  // Statistics
  // =========================

  const analyzedPatients =
    patients.filter(
      (patient) =>
        getLatestResult(patient.id)
    ).length;


  const anomalyPatients =
    patients.filter((patient) => {
      const result =
        getLatestResult(patient.id);

      return result?.is_anomaly === true;
    }).length;


  const normalPatients =
    patients.filter((patient) => {
      const result =
        getLatestResult(patient.id);

      return result?.is_anomaly === false;
    }).length;


  // =========================
  // Styles
  // =========================

  const styles = {
    page: {
      padding: "30px",
      maxWidth: "1400px",
      margin: "0 auto",
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      marginBottom: "24px",
    },

    title: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 700,
      color: "#0f172a",
    },

    subtitle: {
      margin: "7px 0 0",
      fontSize: "13px",
      color: "#64748b",
    },

    refreshButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid #dbe3ef",
      background: "#ffffff",
      color: "#334155",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(3, minmax(0, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },

    statCard: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "18px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },

    statIcon: {
      width: "42px",
      height: "42px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    statLabel: {
      display: "block",
      fontSize: "12px",
      color: "#64748b",
      marginBottom: "4px",
    },

    statValue: {
      display: "block",
      fontSize: "22px",
      fontWeight: 700,
      color: "#0f172a",
    },

    panel: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
    },

    panelHeader: {
      padding: "20px 22px",
      borderBottom: "1px solid #e8edf3",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
    },

    panelTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: 700,
      color: "#0f172a",
    },

    panelSubtitle: {
      margin: "5px 0 0",
      fontSize: "12px",
      color: "#64748b",
    },

    search: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "220px",
      height: "38px",
      border: "1px solid #dbe3ef",
      borderRadius: "8px",
      padding: "0 12px",
      color: "#94a3b8",
      background: "#ffffff",
    },

    searchInput: {
      border: "none",
      outline: "none",
      width: "100%",
      fontSize: "12px",
      color: "#334155",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    tableHeader: {
      display: "grid",
      gridTemplateColumns:
        "minmax(200px, 1.8fr) 90px 120px 130px 140px 150px",
      minWidth: "830px",
      padding: "12px 20px",
      background: "#f8fafc",
      borderBottom:
        "1px solid #e8edf3",
      color: "#64748b",
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    tableRow: {
      display: "grid",
      gridTemplateColumns:
        "minmax(200px, 1.8fr) 90px 120px 130px 140px 150px",
      minWidth: "830px",
      padding: "15px 20px",
      alignItems: "center",
      borderBottom:
        "1px solid #edf1f5",
      fontSize: "12px",
      color: "#475569",
    },

    patientCell: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    avatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "#eaf2ff",
      color: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: "12px",
      flexShrink: 0,
    },

    patientName: {
      display: "block",
      color: "#0f172a",
      fontWeight: 600,
      fontSize: "12px",
    },

    patientId: {
      display: "block",
      color: "#94a3b8",
      fontSize: "10px",
      marginTop: "2px",
    },

    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "6px 9px",
      borderRadius: "7px",
      fontSize: "10px",
      fontWeight: 600,
      width: "fit-content",
    },

    score: {
      fontWeight: 700,
      color: "#0f172a",
    },

    detectButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      border: "none",
      borderRadius: "7px",
      background: "#2563eb",
      color: "#ffffff",
      padding: "8px 12px",
      fontSize: "11px",
      fontWeight: 600,
      cursor: "pointer",
    },

    disabledButton: {
      opacity: 0.6,
      cursor: "not-allowed",
    },

    loading: {
      padding: "50px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "13px",
    },

    error: {
      marginBottom: "18px",
      padding: "12px 15px",
      borderRadius: "8px",
      background: "#fff1f2",
      border: "1px solid #fecdd3",
      color: "#be123c",
      fontSize: "12px",
    },

    empty: {
      padding: "50px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "13px",
    },
  };


  return (
    <div style={styles.page}>

      {/* =========================
          Page Header
      ========================= */}

      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>
            Anomalies
          </h2>

          <p style={styles.subtitle}>
            Detect unusual combinations of
            patient vital measurements using
            the Isolation Forest model.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={loadAnomalyData}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>


      {/* =========================
          Error
      ========================= */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}


      {/* =========================
          Statistics
      ========================= */}

      <div style={styles.statsGrid}>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#eaf2ff",
              color: "#2563eb",
            }}
          >
            <Activity size={20} />
          </div>

          <div>
            <span style={styles.statLabel}>
              Patients Analyzed
            </span>

            <strong style={styles.statValue}>
              {analyzedPatients}
            </strong>
          </div>
        </div>


        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#fff4e5",
              color: "#f59e0b",
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <span style={styles.statLabel}>
              Anomalies Detected
            </span>

            <strong style={styles.statValue}>
              {anomalyPatients}
            </strong>
          </div>
        </div>


        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#e9f9ef",
              color: "#16a34a",
            }}
          >
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span style={styles.statLabel}>
              Normal Results
            </span>

            <strong style={styles.statValue}>
              {normalPatients}
            </strong>
          </div>
        </div>

      </div>


      {/* =========================
          Main Panel
      ========================= */}

      <section style={styles.panel}>

        <div style={styles.panelHeader}>

          <div>
            <h3 style={styles.panelTitle}>
              Patient Anomaly Analysis
            </h3>

            <p style={styles.panelSubtitle}>
              Latest Isolation Forest result
              for each patient.
            </p>
          </div>


          <div style={styles.search}>
            <Search size={15} />

            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              style={styles.searchInput}
            />
          </div>

        </div>


        {loading ? (
          <div style={styles.loading}>
            Loading anomaly information...
          </div>
        ) : (

          <div style={styles.tableWrapper}>

            {/* Table Header */}

            <div style={styles.tableHeader}>
              <span>Patient</span>
              <span>Age</span>
              <span>Status</span>
              <span>Anomaly Score</span>
              <span>Latest Vitals</span>
              <span>Action</span>
            </div>


            {/* Table Rows */}

            {filteredPatients.length === 0 ? (

              <div style={styles.empty}>
                No patients found.
              </div>

            ) : (

              filteredPatients.map(
                (patient) => {

                  const result =
                    getLatestResult(
                      patient.id
                    );

                  const isAnalyzed =
                    result !== null;

                  const isAnomaly =
                    result?.is_anomaly === true;


                  return (
                    <div
                      key={patient.id}
                      style={styles.tableRow}
                    >

                      {/* Patient */}

                      <div
                        style={styles.patientCell}
                      >
                        <div
                          style={styles.avatar}
                        >
                          {patient.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <span
                            style={
                              styles.patientName
                            }
                          >
                            {patient.name}
                          </span>

                          <span
                            style={
                              styles.patientId
                            }
                          >
                            ID #{patient.id}
                          </span>
                        </div>
                      </div>


                      {/* Age */}

                      <span>
                        {patient.age}
                      </span>


                      {/* Status */}

                      <div>

                        {!isAnalyzed ? (

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                "#f1f5f9",
                              color:
                                "#64748b",
                            }}
                          >
                            Not Analyzed
                          </span>

                        ) : isAnomaly ? (

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                "#fff1f2",
                              color:
                                "#dc2626",
                            }}
                          >
                            <ShieldAlert
                              size={12}
                            />
                            Anomaly
                          </span>

                        ) : (

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                "#e9f9ef",
                              color:
                                "#15803d",
                            }}
                          >
                            <CheckCircle2
                              size={12}
                            />
                            Normal
                          </span>

                        )}

                      </div>


                      {/* Score */}

                      <span style={styles.score}>
                        {isAnalyzed
                          ? Number(
                              result.anomaly_score
                            ).toFixed(4)
                          : "—"}
                      </span>


                      {/* Vitals */}

                      <span>
                        {patient.heart_rate !==
                        null &&
                        patient.heart_rate !==
                        undefined
                          ? `${patient.heart_rate} bpm`
                          : "—"}

                        {" • "}

                        {patient.systolic_bp !==
                          null &&
                        patient.systolic_bp !==
                          undefined &&
                        patient.diastolic_bp !==
                          null &&
                        patient.diastolic_bp !==
                          undefined
                          ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                          : "—"}
                      </span>


                      {/* Action */}

                      <button
                        style={{
                          ...styles.detectButton,
                          ...(detectingPatient ===
                          patient.id
                            ? styles.disabledButton
                            : {}),
                        }}
                        disabled={
                          detectingPatient ===
                          patient.id
                        }
                        onClick={() =>
                          handleDetect(
                            patient.id
                          )
                        }
                      >
                        {detectingPatient ===
                        patient.id ? (
                          <>
                            <RefreshCw
                              size={12}
                            />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Activity
                              size={12}
                            />
                            Run Detection
                          </>
                        )}
                      </button>

                    </div>
                  );
                }
              )

            )}

          </div>

        )}

      </section>


      {/* =========================
          Disclaimer
      ========================= */}

      <div
        style={{
          marginTop: "18px",
          padding: "13px 16px",
          borderRadius: "8px",
          background: "#fffaf0",
          border: "1px solid #f5d9a6",
          color: "#8a5a12",
          fontSize: "11px",
          lineHeight: 1.6,
        }}
      >
        <strong>
          Important:
        </strong>{" "}
        Anomaly scores identify unusual
        combinations of recorded measurements
        relative to the model's training data.
        They are not medical risk probabilities
        or diagnoses.
      </div>

    </div>
  );
}

export default Anomalies;