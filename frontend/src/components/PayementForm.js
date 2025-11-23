import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

function PaymentForm({ cart = [], setCart, total }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [customer, setCustomer] = useState(localStorage.getItem("customer"));
  const [isSignedIn, setIsSignedIn] = useState(
    !!localStorage.getItem("authToken")
  );
  const [stockError, setStockError] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const storedCustomer = localStorage.getItem("customer");

    if (authToken && storedCustomer) {
      const parsedCustomer = JSON.parse(storedCustomer);
      setCustomer(parsedCustomer);
      setFormData((prev) => ({
        ...prev,
        name: parsedCustomer.name || "",
        email: parsedCustomer.email || "",
        address: parsedCustomer.address || "",
      }));
      setIsSignedIn(true);
    }
  }, []);

  const computedTotal =
    typeof total === "number"
      ? total
      : cart.reduce(
          (sum, item) => sum + (item.price || 0) * (item.qty || 1),
          0
        );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Async stock validation function
  const validateStock = async () => {
    if (!cart || cart.length === 0) return null;

    const itemsWithLatestStock = await Promise.all(
      cart.map(async (item) => {
        const stockId =
          (item.id != null ? item.id.toString() : null) ?? item.productID;

        if (!stockId) {
          return { item, latestStock: item.stock };
        }

        try {
          const res = await fetch(`${API_BASE}/products/stock/${stockId}`);
          if (!res.ok) throw new Error("Failed to fetch stock");
          const text = await res.text();
          const latestStock = Number.parseInt(text, 10);
          return {
            item,
            latestStock: Number.isNaN(latestStock) ? item.stock : latestStock,
          };
        } catch (err) {
          console.error("Error fetching latest stock for", stockId, err);
          // Fallback to whatever stock we had on the item
          return { item, latestStock: item.stock };
        }
      })
    );

    const outOfStock = itemsWithLatestStock.filter(
      ({ latestStock }) => typeof latestStock === "number" && latestStock <= 0
    );
    const insufficientStock = itemsWithLatestStock.filter(
      ({ item, latestStock }) =>
        typeof latestStock === "number" &&
        latestStock > 0 &&
        (item.qty || 1) > latestStock
    );

    if (outOfStock.length === 0 && insufficientStock.length === 0) {
      return null;
    }

    const outOfStockDetails = outOfStock.map(({ item }) => ({
      name: item.name || item.productName || "Unknown product",
      requested: item.qty || 1,
      available: 0,
    }));

    const insufficientStockDetails = insufficientStock.map(
      ({ item, latestStock }) => ({
        name: item.name || item.productName || "Unknown product",
        requested: item.qty || 1,
        available: latestStock ?? 0,
      })
    );

    return {
      outOfStock: outOfStockDetails,
      insufficientStock: insufficientStockDetails,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate stock asynchronously before proceeding
    const stockProblem = await validateStock();
    if (stockProblem) {
      setStockError(stockProblem);
      return;
    }
    setStockError(null);

    try {
      const authToken = localStorage.getItem("authToken");

      const orderPayload = {
        customerId: customer.id,
        totalAmount: computedTotal,
        customerUUID: customer.customerUUID,
        items: cart.map((item) => ({
          productId: item.id ?? item.productID,
          quantity: item.qty || 1,
          price: item.price,
          productUuid: item.productUUID,
          productName: item.productName,
        })),
      };

      const response = await fetch(
        `${API_BASE}/orders/customer/${customer.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit order");

      const order = await response.json();
      console.log("Order created:", order);

      setCart && setCart([]);
      navigate("/thank-you", { state: { order } });
    } catch (err) {
      console.error("Error creating order:", err);
      alert("An error occurred while placing your order.");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="container py-5 text-center">
        <h2>You must be signed in to complete your purchase.</h2>
        <Link to="/signin" className="btn btn-dark mt-3">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Checkout</h1>
      <div className="row g-4">
        {/* Order Summary */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Order Summary</h5>
              {cart.length === 0 ? (
                <div className="text-muted">
                  Your cart is empty. <Link to="/">Go back to shop</Link>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="text-muted small">
                          {item.qty || 1} × {item.price} €
                        </div>
                      </div>
                      <div className="fw-semibold">
                        {((item.qty || 1) * item.price).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between fw-semibold pt-3">
                    <span>Total</span>
                    <span>{computedTotal.toFixed(2)} €</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Payment</h5>
              {stockError && (
                <div className="alert alert-danger mb-3" role="alert">
                  <div className="fw-semibold mb-1">
                    We couldn&apos;t complete your checkout.
                  </div>
                  <div className="small mb-2">
                    Please adjust the quantities for the products below and try
                    again.
                  </div>
                  <ul className="mb-0 small">
                    {stockError.outOfStock?.map((p, index) => (
                      <li key={`oos-${index}`}>
                        <strong>{p.name}</strong> — out of stock (requested{" "}
                        {p.requested}, available {p.available})
                      </li>
                    ))}
                    {stockError.insufficientStock?.map((p, index) => (
                      <li key={`ins-${index}`}>
                        <strong>{p.name}</strong> — only {p.available} left
                        (requested {p.requested})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Card number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cardNumber"
                      placeholder="e.g. 1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Expiry</label>
                    <input
                      type="text"
                      className="form-control"
                      name="expiry"
                      placeholder="MM / YY"
                      value={formData.expiry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">CVC</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cvc"
                      placeholder="e.g. 123"
                      value={formData.cvc}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="fw-semibold">
                    Total: {computedTotal.toFixed(2)} €
                  </div>
                  <button className="btn btn-dark" type="submit">
                    Pay now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
