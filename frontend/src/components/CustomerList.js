// src/components/CustomerList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // ✅ same key as CustomerProfile
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchCustomers(token);
  }, [navigate]);

  async function fetchCustomers(token) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/customers/admin`, {
        method: "GET",
        credentials: "include", // ✅ allow cookies / CORS session
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/signin");
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to fetch customers (${res.status})`);
      }

      const data = await res.json();
      setCustomers(data);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p style={{ padding: "1rem" }}>Loading customers...</p>;
  if (error)
    return <p style={{ padding: "1rem", color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      <h2
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Customer List
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ccc",
        }}
      >
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Address</th>
            <th style={th}>Role</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={td}>{c.id}</td>
              <td style={td}>{c.name}</td>
              <td style={td}>{c.email}</td>
              <td style={td}>{c.address}</td>
              <td style={td}>{c.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  borderBottom: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
