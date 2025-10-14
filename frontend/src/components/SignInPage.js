import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.email.trim() || !form.password.trim())
      return "Please fill in all fields.";
    const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email);
    if (!emailOk) return "Please enter a valid email.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      localStorage.clear();
      const data = await res.json();
      console.log(data);
      localStorage.setItem("role", data.role);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));
/*       if (data.customerId)
        localStorage.setItem("customerId", String(data.customer.id));
      if (data.token) {
      const profileRes = await fetch(`${API_BASE}/customers/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        localStorage.setItem("customer", JSON.stringify(profile));
      }
    } */
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-4 text-center">Sign in to your account</h1>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p
                className="text-center text-muted mt-3 mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                Don't have an account? <a href="/signup">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
