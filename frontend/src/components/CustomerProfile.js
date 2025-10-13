import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    id: "",
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signin");
      return;
    }
    loadCustomer(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function loadCustomer(token) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/customers/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        navigate("/signin");
        return;
      }
      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      if (!isJson) {
        const text = await res.text();
        throw new Error(
          `Non-JSON response (${res.status}): ${text.slice(0, 80)}`
        );
      }
      const data = await res.json();
      setCustomer(data);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signin");
      return;
    }
    console.log(customer);
    try {
      const res = await fetch(`${API_BASE}/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      });
      if (res.status === 401) {
        navigate("/signin");
        return;
      }
      const data = await res.json();
      setCustomer(data);
      setError("");

      alert("Profile updated successfully!");
      navigate("/");
    } catch (e) {
      setError(e.message || "Failed to update profile");
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>My Profile</h1>
      <form onSubmit={saveProfile}>
        <label style={label}>Name</label>
        <input
          style={input}
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <label style={label}>Email</label>
        <input
          type="email"
          style={input}
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
        <label style={label}>Address</label>
        <textarea
          style={input}
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
        />
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={btn}>
            Save
          </button>
          <Link to="/" style={btnOutline}>
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}

const label = {
  display: "block",
  marginTop: "12px",
  marginBottom: "4px",
  fontWeight: "bold",
};
const input = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const btn = {
  padding: "8px 12px",
  background: "#111",
  color: "#fff",
  border: "none",
  marginRight: "8px",
  cursor: "pointer",
};
const btnOutline = {
  ...btn,
  background: "#fff",
  color: "#111",
  border: "1px solid #111",
};
