import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { user, login: loginUser } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />;
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(credentials);
      loginUser(response.data.user, response.data.token);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Leave Management System</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="register-link" style={{ marginTop: "1rem" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>

        <div className="demo-credentials" style={{ marginTop: "1.5rem" }}>
          <p><strong>Demo Credentials:</strong></p>
          <p>Employee: <code>employee@test.com</code> / <code>password123</code></p>
          <p>Admin: <code>admin@test.com</code> / <code>password123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
