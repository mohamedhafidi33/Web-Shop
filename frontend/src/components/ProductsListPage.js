import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProductsListPage() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signin");
      return;
    }
    load();
  }, [navigate]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/products`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });
      if (res.status === 401 || res.status === 403) {
        navigate("/signin");
        return;
      }
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load products (${res.status}). ${text.slice(0, 120)}`
        );
      }
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Unexpected response (not JSON). ${text.slice(0, 120)}`
        );
      }
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    });
    if (res.status === 401 || res.status === 403) {
      navigate("/signin");
      return;
    }
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Delete failed");
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Manage Products</h1>
        <div>
          <Link to="/products/new" style={btn}>
            Add Product
          </Link>
          <button style={btnOutline} onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
      >
        <thead>
          <tr>
            <th style={cell}>Image</th>
            <th style={cell}>Name</th>
            <th style={cell}>Price</th>
            <th style={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td style={cell}>
                <img
                  src={p.imageUrl || "/fallback-product.png"}
                  alt={p.name}
                  style={{
                    width: "80px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                  onError={(e) =>
                    (e.currentTarget.src = "/fallback-product.png")
                  }
                />
              </td>
              <td style={cell}>
                <Link to={`/products/${p.id}`}>{p.name}</Link>
              </td>
              <td style={cell}>€{Number(p.price).toFixed(2)}</td>
              <td style={cell}>
                <button
                  style={btnOutline}
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  Open
                </button>
                <button style={btn} onClick={() => remove(p.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td style={cell} colSpan={4}>
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const btn = {
  padding: "8px 12px",
  background: "#111",
  color: "#fff",
  border: "none",
  marginLeft: "8px",
  cursor: "pointer",
};
const btnOutline = {
  ...btn,
  background: "#fff",
  color: "#111",
  border: "1px solid #111",
};
const cell = {
  padding: "8px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};
