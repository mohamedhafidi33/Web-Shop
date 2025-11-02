import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProductsListPage() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1622428051717-dcd8412959de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480";
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

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/products/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });

      // Do NOT redirect to sign-in here. It's confusing for admins when a delete fails.
      if (res.status === 401) {
        alert(
          "Your session may have expired. Please sign in again and retry deleting."
        );
        return;
      }
      if (res.status === 403) {
        alert("You don't have permission to delete products.");
        return;
      }

      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        return;
      }

      // Fallback for other errors: show first part of the response body, if any
      const ct = res.headers.get("content-type") || "";
      let msg = `Delete failed (${res.status})`;
      try {
        if (ct.includes("application/json")) {
          const data = await res.json();
          if (data && (data.message || data.error)) {
            msg = `${msg}: ${data.message || data.error}`;
          }
        } else {
          const text = await res.text();
          if (text) msg = `${msg}: ${text.slice(0, 120)}`;
        }
      } catch (_) {}
      alert(msg);
    } catch (err) {
      alert(`Network error while deleting: ${err?.message || err}`);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={pageWrap}>
      <div style={headBar}>
        <div>
          <h1 style={title}>Manage Products</h1>
          <p style={subtitle}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div>
          <Link to="/products/new" style={btnPrimary}>
            + Add product
          </Link>
          <button style={btnGhost} onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      <div style={card}>
        <table style={table}>
          <thead style={thead}>
            <tr>
              <th style={th}>Image</th>
              <th style={th}>Name</th>
              <th style={thRight}>Price</th>
              <th style={thCenter}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                style={tr}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={td}>
                  <img
                    src={p.imageUrl || FALLBACK_IMAGE}
                    alt={p.name}
                    style={thumb}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  />
                </td>
                <td style={td}>
                  <Link to={`/products/${p.id}`} style={link}>
                    {p.name}
                  </Link>
                </td>
                <td style={tdRight}>€{Number(p.price).toFixed(2)}</td>
                <td style={tdCenter}>
                  <button
                    style={btnGhostSm}
                    onClick={() => navigate(`/products/${p.id}`)}
                    title="Open"
                  >
                    Open
                  </button>
                  <button style={btnDangerSm} onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td style={emptyTd} colSpan={4}>
                  <div style={emptyBox}>
                    <img
                      src={FALLBACK_IMAGE}
                      alt=""
                      style={{
                        width: 64,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 8,
                        opacity: 0.7,
                        marginBottom: 12,
                      }}
                    />
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      No products yet.
                    </p>
                    <Link
                      to="/products/new"
                      style={{ ...btnPrimary, marginTop: 12 }}
                    >
                      Add your first product
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const pageWrap = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "24px 16px",
};

const headBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  marginBottom: 16,
};

const title = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
};

const subtitle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: 14,
};

const card = {
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const table = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

const thead = {
  background: "#f9fafb",
};

const thBase = {
  padding: "14px 16px",
  fontWeight: 600,
  fontSize: 13,
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
};

const th = { ...thBase };
const thRight = { ...thBase, textAlign: "right" };
const thCenter = { ...thBase, textAlign: "center" };

const tr = {
  transition: "background 120ms ease",
};

const tdBase = {
  padding: "14px 16px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
  color: "#111827",
};

const td = { ...tdBase, textAlign: "left" };
const tdRight = { ...tdBase, textAlign: "right", whiteSpace: "nowrap" };
const tdCenter = { ...tdBase, textAlign: "center", whiteSpace: "nowrap" };

const emptyTd = { ...tdBase, textAlign: "center" };

const thumb = {
  width: 80,
  height: 60,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#f3f4f6",
};

const link = {
  color: "#111827",
  textDecoration: "none",
  transition: "color 120ms ease",
};

const btnBase = {
  padding: "10px 14px",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid transparent",
  cursor: "pointer",
  marginLeft: 8,
};

const btnPrimary = {
  ...btnBase,
  background: "#2563eb",
  borderColor: "#2563eb",
  color: "#ffffff",
};

const btnGhost = {
  ...btnBase,
  background: "#ffffff",
  color: "#111827",
  borderColor: "#d1d5db",
};

const btnGhostSm = {
  ...btnGhost,
  padding: "6px 10px",
  fontSize: 13,
  marginLeft: 6,
};

const btnDangerSm = {
  ...btnGhostSm,
  color: "#b91c1c",
  borderColor: "#fecaca",
  background: "#fff5f5",
};

const emptyBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "36px 12px",
};
