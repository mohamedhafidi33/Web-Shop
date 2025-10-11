import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
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
    loadCustomer();
  }, [navigate]);

  async function loadCustomer() {
    try {
      setLoading(true);
      const res = await fetch("/customers/me");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setCustomer(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const res = await fetch("/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile updated successfully!");
    } catch (e) {
      alert(e.message);
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
