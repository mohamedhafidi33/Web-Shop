import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

function ProductPage({ products, cart, setCart }) {
  const { id } = useParams();
  const p = products.find((item) => item.id === Number(id));
  const [qty, setQty] = useState(1);
  const getImage = (p) =>
    p && p.imageUrl && p.imageUrl.trim() !== ""
      ? p.imageUrl
      : "https://images.unsplash.com/photo-1622428051717-dcd8412959de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480";
  const addToCart = (product, amount = 1) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      const updated = cart.map((item) =>
        item.id === product.id
          ? { ...item, qty: (item.qty || 1) + amount }
          : item
      );
      setCart(updated);
    } else {
      setCart([...cart, { ...product, qty: amount }]);
    }
  };
  return (
    <div className="container py-5">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6">
          <img
            src={getImage(p)}
            alt={p.name}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-12 col-lg-6">
          <h1 className="h3 mb-2">{p.name}</h1>
          <p className="text-muted">{p.description}</p>
          <div className="fs-4 fw-semibold mb-3">{p.price} €</div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-muted">Quantity</span>
            <div
              className="d-flex align-items-center border rounded"
              style={{ width: 140 }}
            >
              <button
                className="btn btn-outline-secondary flex-fill"
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div
                className="flex-fill text-center fw-semibold"
                style={{ padding: "0.5rem 0" }}
              >
                {qty}
              </div>
              <button
                className="btn btn-outline-secondary flex-fill"
                type="button"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-dark"
              onClick={() => {
                addToCart(p, qty);
                const sidebar = document.getElementById("cartSidebar");
                if (sidebar) {
                  const bsOffcanvas = new window.bootstrap.Offcanvas(sidebar);
                  bsOffcanvas.show();
                }
              }}
            >
              Add to cart
            </button>
            <Link to="/" className="btn btn-outline-dark">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
