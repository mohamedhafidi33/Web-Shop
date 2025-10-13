import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const navigate = useNavigate();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priceNumber = useMemo(() => {
    const n = parseFloat(String(form.price).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [form.price]);

  if (!token) {
    return (
      <div className="page">
        <div
          className="card"
          style={{ maxWidth: 720, margin: "2rem auto", padding: "1.5rem" }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>Sign in required</h2>
          <p style={{ marginBottom: "1rem" }}>
            You need to be signed in to create products.
          </p>
          <Link className="btn btn-primary" to="/signin">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.price || !Number.isFinite(priceNumber) || priceNumber <= 0)
      return "Price must be a positive number";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/products/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description?.trim() || "",
          price: priceNumber,
          imageUrl: form.imageUrl?.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }

      await res.json().catch(() => ({}));
      alert("Product created successfully.");
      navigate("/products/list");
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const Preview = () => {
    const url = form.imageUrl?.trim();
    if (!url)
      return (
        <div
          style={{
            width: "100%",
            height: 260,
            background: "#fafafa",
            border: "1px dashed #d9d9d9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}
        >
          <span style={{ color: "#999" }}>Image preview</span>
        </div>
      );
    return (
      <img
        src={url}
        alt="Preview"
        style={{
          width: "100%",
          height: 260,
          objectFit: "cover",
          borderRadius: 12,
          border: "1px solid #eee",
        }}
        onError={(e) => {
          e.currentTarget.style.opacity = 0.3;
        }}
      />
    );
  };

  return (
    <div className="page">
      <div
        className="card"
        style={{
          maxWidth: 980,
          margin: "2rem auto",
          padding: "2rem",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Create New Product</h2>
          <Link to="/products" className="btn btn-secondary">
            Back to Products
          </Link>
        </div>

        {error && (
          <div
            className="alert"
            style={{
              marginBottom: "1rem",
              color: "#842029",
              background: "#f8d7da",
              padding: "0.75rem 1rem",
              borderRadius: 10,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div
            className="form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <div>
              <label
                className="label"
                htmlFor="name"
                style={{ marginTop: "0.75rem", display: "block" }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                className="input"
                type="text"
                placeholder="eg. Wireless Mouse"
                value={form.name}
                onChange={onChange}
                required
                style={{ width: "100%" }}
              />

              <label
                className="label"
                htmlFor="description"
                style={{ marginTop: "0.75rem", display: "block" }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="input"
                placeholder="Short description..."
                value={form.description}
                onChange={onChange}
                rows={5}
                style={{ width: "100%", resize: "vertical" }}
              />

              <label
                className="label"
                htmlFor="price"
                style={{ marginTop: "0.75rem", display: "block" }}
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                className="input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 29.99"
                value={form.price}
                onChange={onChange}
                required
                style={{ width: "100%" }}
              />

              <label
                className="label"
                htmlFor="imageUrl"
                style={{ marginTop: "0.75rem", display: "block" }}
              >
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                className="input"
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={onChange}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <Preview />
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>
                Paste a direct image URL (optional). A preview is shown if the
                link is reachable.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Create Product"}
            </button>
            <button
              type="button"
              className="btn"
              disabled={submitting}
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
