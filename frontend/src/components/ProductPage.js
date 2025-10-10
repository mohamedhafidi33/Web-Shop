import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

function ProductPage({ products, cart, setCart }) {
  const { id } = useParams();
  const p = products.find((item) => item.id === Number(id));
  const [qty, setQty] = useState(1);
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
            src={p.image}
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
