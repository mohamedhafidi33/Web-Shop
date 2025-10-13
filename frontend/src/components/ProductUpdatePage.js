import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function ProductUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signin");
      return;
    }
    loadProduct();
  }, [id, navigate]);

  async function loadProduct() {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to load product (${res.status})`);
      }
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned non-JSON response");
      }
      setProduct(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/products/admin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Failed to update product");
      alert("Product updated successfully!");
      navigate("/products/list");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;
  if (!product) return <div style={{ padding: "2rem" }}>Product not found</div>;

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={headerRow}>
          <h1 style={title}>Edit Product</h1>
          <Link to="/products/list" style={linkButton}>
            ← Back
          </Link>
        </div>

        <form onSubmit={saveProduct}>
          <div style={grid}>
            <div>
              <label style={label}>Name</label>
              <input
                style={input}
                value={product.name || ""}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                required
              />

              <label style={label}>Description</label>
              <textarea
                style={{ ...input, minHeight: 100, resize: "vertical" }}
                value={product.description || ""}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              />

              <div style={twoCols}>
                <div style={{ flex: 1 }}>
                  <label style={label}>Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    style={input}
                    value={product.price}
                    onChange={(e) =>
                      setProduct({ ...product, price: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>Image URL</label>
                  <input
                    style={input}
                    value={product.imageUrl || ""}
                    onChange={(e) =>
                      setProduct({ ...product, imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button type="submit" style={primaryBtn} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>

            <div style={previewWrap}>
              <div style={previewBox}>
                {product.imageUrl ? (
                  <img
                    alt={product.name}
                    src={product.imageUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=Preview";
                    }}
                  />
                ) : (
                  <div style={previewEmpty}>No image</div>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                Live preview
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const pageWrap = {
  display: "flex",
  justifyContent: "center",
  padding: "24px 16px",
};

const card = {
  width: "100%",
  maxWidth: 900,
  background: "#fff",
  border: "1px solid #eaeaea",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  borderRadius: 12,
  padding: 24,
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const title = {
  margin: 0,
  fontSize: 22,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 360px",
  gap: 24,
};

const label = {
  display: "block",
  marginTop: 12,
  marginBottom: 6,
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d0d0d0",
  borderRadius: 8,
  outline: "none",
};

const twoCols = {
  display: "flex",
  gap: 16,
  marginTop: 8,
};

const primaryBtn = {
  marginTop: 16,
  padding: "10px 14px",
  background: "#111",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  cursor: "pointer",
};

const linkButton = {
  textDecoration: "none",
  border: "1px solid #111",
  padding: "8px 12px",
  borderRadius: 8,
  color: "#111",
};

const previewWrap = {
  alignSelf: "start",
};

const previewBox = {
  width: "100%",
  height: 240,
  background: "#f7f7f7",
  border: "1px solid #eaeaea",
  borderRadius: 8,
  overflow: "hidden",
};

const previewEmpty = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "#888",
};
