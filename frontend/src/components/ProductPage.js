import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

function ProductPage({ products, cart, setCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const p = useMemo(() => {
    return products.find(
      (item) => item.id?.toString() === id || item.productID === id
    );
  }, [products, id]);

  const [qty, setQty] = useState(1);
  const [stock, setStock] = useState(null); // null = not loaded yet
  const [imgHover, setImgHover] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/products/stock/${id}`)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((t) => setStock(Number.parseInt(t, 10)))
      .catch(() => setStock(-1));
  }, [id]);

  const getImage = (prod) =>
    prod && prod.imageUrl && prod.imageUrl.trim() !== ""
      ? prod.imageUrl
      : "https://images.unsplash.com/photo-1622428051717-dcd8412959de?auto=format&fit=crop&q=80&w=1600";

const addToCart = (product, amount = 1) => {
  const key = product.id ?? product.productID;

  const exists = cart.find((item) => {
    return (item.id ?? item.productID) === key;
  });

  if (exists) {
    const updated = cart.map((item) =>
      (item.id ?? item.productID) === key
        ? { ...item, qty: (item.qty || 1) + amount }
        : item
    );
    setCart(updated);
  } else {
    setCart([
      ...cart,
      {
        ...product,
        qty: amount,
        productId: product.productID,
        productUUID: product.productUUID,
        productName: product.name,
      },
    ]);
  }
};


  const formatPrice = (value) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(value);

  if (!p) {
    return (
      <div className="container py-5" style={{ minHeight: "60vh" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Product not found
              </li>
            </ol>
          </nav>
          <Link to="/" className="btn btn-outline-dark">
            Back
          </Link>
        </div>
        <div className="text-center text-muted py-5">
          This product does not exist.
        </div>
      </div>
    );
  }

  const stockBadge = () => {
    if (stock === null)
      return <span className="badge bg-light text-dark">Checking stock…</span>;
    if (stock < 0)
      return <span className="badge bg-danger">Error getting stock</span>;
    if (stock === 0)
      return <span className="badge bg-danger">Out of stock</span>;
    if (stock <= 5)
      return (
        <span className="badge bg-warning text-dark">Only {stock} left</span>
      );
    return <span className="badge bg-success">In stock: {stock}</span>;
  };

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: 1140 }}>
      {/* Top bar: breadcrumbs + actions */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/">Products</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {p.name}
            </li>
          </ol>
        </nav>
        <div className="d-none d-lg-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.print()}
          >
            Print
          </button>
          <Link to="/" className="btn btn-outline-dark">
            Back
          </Link>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        {/* Left: Product media */}
        <div className="col-12 col-lg-6">
          <div
            className="position-relative rounded shadow-sm overflow-hidden bg-light"
            style={{
              aspectRatio: "4 / 3",
              cursor: "zoom-in",
              transition: "transform .25s ease, box-shadow .25s ease",
              transform: imgHover ? "scale(1.01)" : "scale(1)",
            }}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
          >
            <img
              src={getImage(p)}
              alt={p.name}
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
            {/* Subtle corner badge */}
            <div className="position-absolute top-0 start-0 m-2">
              {stockBadge()}
            </div>
          </div>
        </div>

        {/* Right: Product details */}
        <div className="col-12 col-lg-6">
          <h1 className="h2 mb-2">{p.name}</h1>
          <div className="text-muted mb-3">
            {p.productID || p.productId || `SKU-${p.id}`}
          </div>

          <div className="d-flex align-items-end gap-3 mb-3">
            <div className="display-6 fw-semibold" style={{ lineHeight: 1 }}>
              {formatPrice(p.price)}
            </div>
            <small className="text-muted">Incl. VAT</small>
          </div>

          {p.description && (
            <p className="text-secondary" style={{ fontSize: "1.05rem" }}>
              {p.description}
            </p>
          )}

          {/* Quantity selector */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-muted">Quantity</span>
            <div
              className="d-flex align-items-center border rounded-3 px-1"
              style={{ width: 180 }}
            >
              <button
                className="btn btn-link text-dark text-decoration-none px-3"
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div
                className="flex-fill text-center fw-semibold"
                style={{ padding: ".5rem 0" }}
              >
                {qty}
              </div>
              <button
                className="btn btn-link text-dark text-decoration-none px-3"
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="d-grid gap-2 gap-md-3 d-md-flex mb-3">
            <button
              disabled={stock === 0}
              className="btn btn-dark btn-lg px-4"
              onClick={() => {
                addToCart(p, qty);
                const sidebar = document.getElementById("cartSidebar");
                if (sidebar && window.bootstrap?.Offcanvas) {
                  const bsOffcanvas = new window.bootstrap.Offcanvas(sidebar);
                  bsOffcanvas.show();
                }
              }}
            >
              Add to cart
            </button>
            <button
              disabled={stock === 0}
              className="btn btn-outline-dark btn-lg px-4"
              onClick={() => {
                addToCart(p, qty);
                navigate("/");
              }}
            >
              Continue shopping
            </button>
          </div>

          {/* Trust + meta */}
          <div className="small text-muted">
            Free returns within 30 days · Secure checkout · 2-year warranty
          </div>
        </div>
      </div>

      {/* Sticky action bar for mobile */}
      <div className="d-lg-none position-sticky bottom-0 start-0 end-0 bg-white border-top py-2 px-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">{formatPrice(p.price)}</div>
          <button
            disabled={stock === 0}
            className="btn btn-dark"
            onClick={() => addToCart(p, qty)}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
