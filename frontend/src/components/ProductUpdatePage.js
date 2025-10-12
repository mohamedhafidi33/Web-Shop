import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ProductUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
      const res = await fetch(`/products/${id}`);
      if (!res.ok) throw new Error("Failed to load product");
      const data = await res.json();
      setProduct(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/products/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Failed to update product");
      alert("Product updated successfully!");
      navigate("/products/manage");
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem" }}>Error: {error}</div>;
  if (!product) return <div style={{ padding: "2rem" }}>Product not found</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>Edit Product</h1>
      <form onSubmit={saveProduct}>
        <label style={label}>Name</label>
        <input
          style={input}
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />
        <label style={label}>Description</label>
        <textarea
          style={input}
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />
        <label style={label}>Price (€)</label>
        <input
          type="number"
          step="0.01"
          style={input}
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />
        <label style={label}>Image URL</label>
        <input
          style={input}
          value={product.imageUrl || ""}
          onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
        />
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={btn}>
            Save
          </button>
          <Link to="/products/manage" style={btnOutline}>
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
