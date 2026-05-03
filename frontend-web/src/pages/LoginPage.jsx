import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import LoginRoleTabs from "../components/LoginRoleTabs.jsx";
import { loginUser } from "../services/api.js";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await loginUser({ ...form, role });
      localStorage.setItem("dent_ai_token", data.token);
      localStorage.setItem("dent_ai_user", JSON.stringify(data.user));
      setMessage(`Login successful as ${data.user.role}.`);
      setForm({ email: "", password: "" });

      // Redirect based on role
      if (data.user.role === "patient") {
        setTimeout(() => navigate("/patient/dashboard"), 500);
      } else if (data.user.role === "doctor") {
        setTimeout(() => navigate("/doctor/dashboard"), 500);
      } else if (data.user.role === "admin") {
        setTimeout(() => navigate("/admin/dashboard"), 500);
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Access Portal" subtitle="Welcome Back">
      <LoginRoleTabs selectedRole={role} onChange={setRole} />

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Work Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@dentai.com"
            required
          />
        </label>

        <label>
          Security Key
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : `Sign In as ${role}`}
        </button>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}

        <p className="switch-link">
          Do not have an account? <Link to="/register">Create Account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
