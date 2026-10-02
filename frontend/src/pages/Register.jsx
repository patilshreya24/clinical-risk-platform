import { useState } from "react";
import {
  Activity,
  Building2,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { clinicRegister } from "../api";

function Register({ onRegister, onBackToLogin }) {
  const [clinicName, setClinicName] = useState("");
  const [administratorName, setAdministratorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await clinicRegister({
        clinic_name: clinicName,
        administrator_name: administratorName,
        email,
        password,
      });

      onRegister(data);
    } catch (err) {
      setError(
        err.message || "Unable to register the clinic."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card register-card">

        <div className="login-logo">
          <Activity size={28} />
        </div>

        <h1>ClinicalAI</h1>

        <p className="login-subtitle">
          Clinical Risk Intelligence Platform
        </p>

        <div className="login-heading">
          <h2>Create Clinic Account</h2>
          <p>
            Register your clinic to access the clinical dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Clinic Name</label>

          <div className="login-input">
            <Building2 size={18} />

            <input
              type="text"
              placeholder="Enter clinic name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            />
          </div>

          <label>Administrator Name</label>

          <div className="login-input">
            <User size={18} />

            <input
              type="text"
              placeholder="Enter administrator name"
              value={administratorName}
              onChange={(e) =>
                setAdministratorName(e.target.value)
              }
              required
            />
          </div>

          <label>Email</label>

          <div className="login-input">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Enter clinic email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <label>Confirm Password</label>

          <div className="login-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Clinic Account"}
          </button>

        </form>

        <div className="register-login">
          Already have a clinic account?
          <button
            type="button"
            onClick={onBackToLogin}
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;
