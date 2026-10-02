import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Anomalies from "./pages/Anomalies";
import RiskAnalysis from "./pages/RiskAnalysis";
import Explainability from "./pages/Explainability";
import ModelPerformance from "./pages/ModelPerformance";
import RiskAssessment from "./pages/RiskAssessment";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("clinicToken"))
  );

  const [showRegister, setShowRegister] = useState(false);

  const [activePage, setActivePage] = useState("overview");

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [assessmentPatient, setAssessmentPatient] =
  useState(null);

    function handleLogin(data) {
    setIsLoggedIn(true);
  }
  function handleRegistration(data) {
  setShowRegister(false);
}

  function handleLogout() {
  localStorage.removeItem("clinicToken");
  localStorage.removeItem("clinicName");
  localStorage.removeItem("administratorName");

  setIsLoggedIn(false);
  setActivePage("overview");
  setSelectedPatient(null);
  setAssessmentPatient(null);
}

  function handlePageChange(page) {
  setActivePage(page);

  // Close patient profile and risk assessment
  // when navigating to another main section
  setSelectedPatient(null);
  setAssessmentPatient(null);
}


  function renderPage() {

    /* =========================
   RISK ASSESSMENT
========================= */

if (
  activePage === "patients" &&
  assessmentPatient
) {
  return (
    <RiskAssessment
  patientId={assessmentPatient.id}
  onBack={() => setAssessmentPatient(null)}
/>
  );
}

    /* =========================
       PATIENT PROFILE
    ========================= */

    if (
  activePage === "patients" &&
  selectedPatient
) {
  return (
    <PatientProfile
      patient={selectedPatient}
      onBack={() => setSelectedPatient(null)}
      onStartRiskAssessment={(patient) => {
  setAssessmentPatient(patient);
}}
    />
  );
}


    /* =========================
       MAIN PAGES
    ========================= */

    switch (activePage) {

      case "overview":
        return <Dashboard />;


      case "patients":
        return (
          <Patients
            onPatientSelect={(patient) =>
              setSelectedPatient(patient)
            }
          />
        );


      case "anomalies":
        return <Anomalies />;


      case "risk":
  return <RiskAnalysis />;


      case "explainability":
  return <Explainability />;


      case "performance":
  return <ModelPerformance />;


      default:
        return <Dashboard />;
    }
  }


    if (!isLoggedIn) {
  if (showRegister) {
    return (
      <Register
        onRegister={handleRegistration}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
      />

      <main className="main-content">
  <Header
  activePage={activePage}
  onLogout={handleLogout}
/>
  {renderPage()}
</main>
    </div>
  );
}


export default App;