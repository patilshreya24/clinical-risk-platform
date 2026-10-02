import { useState } from "react";
import { Activity, Lock, Mail } from "lucide-react";
import { clinicLogin } from "../api";

function Login({ onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await clinicLogin(email, password);

      localStorage.setItem("clinicToken", data.access_token);
      localStorage.setItem("clinicName", data.clinic_name);
      localStorage.setItem(
        "administratorName",
        data.administrator_name
      );

      onLogin(data);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <Activity size={28} />
        </div>

        <h1>ClinicalAI</h1>

        <p className="login-subtitle">
          Clinical Risk Intelligence Platform
        </p>

        <div className="login-heading">
          <h2>Clinic Login</h2>
          <p>Sign in to access the clinical dashboard.</p>
        </div>

        <form onSubmit={handleSubmit}>

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
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="register-login">
  Don't have a clinic account?
  <button
    type="button"
    onClick={onRegisterClick}
  >
    Create one
  </button>
</div>

        </form>

        

      </div>
    </div>
  );
}

export default Login;