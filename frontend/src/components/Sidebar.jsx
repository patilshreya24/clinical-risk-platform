import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  Brain,
  BarChart3,
  Info,
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      name: "Overview",
      icon: LayoutDashboard,
      page: "overview",
    },
    {
      name: "Patients",
      icon: Users,
      page: "patients",
    },
    {
      name: "Risk Analysis",
      icon: Activity,
      page: "risk",
    },
    {
      name: "Anomalies",
      icon: AlertTriangle,
      page: "anomalies",
    },
    {
      name: "Explainability",
      icon: Brain,
      page: "explainability",
    },
    {
      name: "Model Performance",
      icon: BarChart3,
      page: "performance",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Activity size={22} />
        </div>

        <div>
          <h2>ClinicalAI</h2>
          <span>Risk Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section-title">MAIN MENU</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.page}
              className={`nav-item ${
                activePage === item.page ? "active" : ""
              }`}
              onClick={() => setActivePage(item.page)}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-section-title">SYSTEM</div>

        <div className="system-status">
          <span className="status-dot"></span>
          <div>
            <strong>System Online</strong>
            <small>All services operational</small>
          </div>
        </div>

        
      </div>
    </aside>
  );
}

export default Sidebar;