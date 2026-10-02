import {
  Bell,
  Search,
  Building2,
  UserCircle,
} from "lucide-react";

function Header({ activePage, onLogout }) {
  const pageTitles = {
    overview: "Overview",
    patients: "Patients",
    risk: "Risk Analysis",
    anomalies: "Anomaly Detection",
    explainability: "Explainability",
    performance: "Model Performance",
  };

  const clinicName =
    localStorage.getItem("clinicName") || "ClinicalAI Clinic";

  const administratorName =
    localStorage.getItem("administratorName") || "Clinic Administrator";

  return (
    <header className="top-header">
      <div>
        <p className="header-label">CLINICAL RISK INTELLIGENCE</p>
        <h1>{pageTitles[activePage]}</h1>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search patients..." />
        </div>

        <button className="header-icon">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="clinic-avatar">
            <Building2 size={21} />
          </div>

          <div className="clinic-info">
            <strong>{clinicName}</strong>
            <span>{administratorName}</span>
          </div>
        </div>

        <button
  className="header-logout"
  onClick={onLogout}
>
  Logout
</button>

      </div>
    </header>
  );
}

export default Header;