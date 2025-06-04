import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { toast } from "react-toastify";
import "./Login.css"; // reuse login styles

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    role: "employee", // default to employee; you can allow admin if you want
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (err.response?.data?.errors
            ? err.response.data.errors[0].msg
            : "Registration failed")
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} required type="email" />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input name="password" value={form.password} onChange={handleChange} required type="password" />
          </div>
          <div className="form-group">
            <label>Employee ID:</label>
            <input name="employeeId" value={form.employeeId} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>    
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div style={{ marginTop: "1rem" }}>
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
