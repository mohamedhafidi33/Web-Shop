import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const [isSignedIn, setIsSignedIn] = useState(!!localStorage.getItem("authToken"));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer?.id) {
      alert("You must be signed in to place an order.");
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");

      const orderPayload = {
        customerId: customer.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty || 1,
        })),
      };

      const response = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

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
