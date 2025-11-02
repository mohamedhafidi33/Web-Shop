import React, { useEffect, useState } from "react";

// Only the real statuses your backend uses
const STATUS_STYLES = {
  PENDING: "secondary",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELED: "danger",
};

function StatusBadge({ status }) {
  const key = String(status ?? "PENDING").toUpperCase();
  const color = STATUS_STYLES[key] || "secondary";
  const label = key.replace(/_/g, " ");
  return (
    <span className={`badge bg-${color} ms-2`} style={{ letterSpacing: 0.2 }}>
      {label}
    </span>
  );
}

export default function PurchaseHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customer = JSON.parse(localStorage.getItem("customer"));
  const token = localStorage.getItem("authToken");
  const BASE_URL = "http://localhost:8080"; // uses your backend base

  useEffect(() => {
    const load = async () => {
      try {
        if (!customer?.id) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${BASE_URL}/orders/customer/${customer.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!customer) return <p>Please sign in first.</p>;
  if (loading) return <p>Loading orders…</p>;
  if (error) return <p style={{ color: "#dc3545" }}>Error: {error}</p>;

  return (
    <div className="container mt-5">
      <h2>Purchase History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="list-group">
          {orders.map((order) => {
            const status = order?.status ?? order?.orderStatus ?? "PENDING";
            return (
              <li key={order.id} className="list-group-item">
                <h5>
                  Order #{order.id}
                  <StatusBadge status={status} />
                </h5>
                <ul>
                  {(order.items || []).map((item) => (
                    <li key={item.id}>
                      {item.productName} – €{item.price} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
