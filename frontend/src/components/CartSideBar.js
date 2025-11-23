import React from "react";
import { useNavigate } from "react-router-dom";

function CartSideBar({ cart, setCart }) {
  const navigate = useNavigate();
  const inc = (id) =>
    setCart((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const currentQty = it.qty || 1;
        const maxStock =
          typeof it.stock === "number" && it.stock > 0 ? it.stock : null;
        if (maxStock == null) {
          return { ...it, qty: currentQty + 1 };
        }
        return { ...it, qty: Math.min(maxStock, currentQty + 1) };
      })
    );
  const dec = (id) =>
    setCart((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, qty: Math.max(0, (it.qty || 1) - 1) } : it
        )
        .filter((it) => (it.qty || 1) > 0)
    );
  const removeItem = (id) =>
    setCart((prev) => prev.filter((it) => it.id !== id));
  const clearCart = () => setCart([]);

  const total = cart
    .reduce((sum, item) => sum + item.price * (item.qty || 1), 0)
    .toFixed(2);

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="cartSidebar"
      aria-labelledby="cartSidebarLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="cartSidebarLabel">
          Your Cart
        </h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div className="offcanvas-body">
        {cart.length === 0 ? (
          <p className="text-muted">Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2"
              >
                <div className="me-2 flex-grow-1">
                  <strong className="d-block">{item.name}</strong>
                  <span className="text-muted small">{item.price} € each</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => dec(item.id)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className="px-2"
                    style={{ minWidth: 24, textAlign: "center" }}
                  >
                    {item.qty || 1}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    aria-label="Increase quantity"
                    disabled={
                      typeof item.stock === "number" &&
                      item.stock > 0 &&
                      (item.qty || 1) >= item.stock
                    }
                    onClick={() => inc(item.id)}
                  >
                    +
                  </button>
                </div>

                <div className="ms-3" style={{ width: 80, textAlign: "right" }}>
                  {((item.qty || 1) * item.price).toFixed(2)} €
                </div>

                <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="mt-3 border-top pt-3 d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>{total} €</span>
            </div>

            <button
              type="button"
              className="btn btn-dark w-100 mt-4"
              onClick={() => {
                const sidebar = document.getElementById("cartSidebar");
                if (sidebar && window.bootstrap?.Offcanvas) {
                  const inst =
                    window.bootstrap.Offcanvas.getInstance(sidebar) ||
                    new window.bootstrap.Offcanvas(sidebar);
                  inst.hide();
                }
                navigate("/checkout");
              }}
            >
              Complete Purchase
            </button>
            <button
              className="btn btn-outline-dark w-100 mt-2"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CartSideBar;
