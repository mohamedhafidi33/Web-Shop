import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      // choose endpoint based on role — admin gets admin endpoint, customers get their own
      const endpoint =
        role === "ADMIN" ? `${API_BASE}/orders/admin` : `${API_BASE}/orders`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Unauthorized — please sign in");
        if (res.status === 403)
          throw new Error("Forbidden — insufficient permissions");
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    await fetch(`${API_BASE}/orders/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    setOrders(orders.filter((o) => o.id !== id));
  }

  async function handleStatusChange(id, newStatus) {
    await fetch(`${API_BASE}/orders/admin/${id}/status?status=${newStatus}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    fetchOrders();
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{role === "ADMIN" ? "All Orders" : "My Orders"}</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Items</th>
            {role === "ADMIN" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName || order.customer?.name || "—"}</td>
              <td>
                {order.totalAmount ? `${order.totalAmount.toFixed(2)} €` : "—"}
              </td>
              <td>
                {role === "ADMIN" ? (
                  <select
                    value={order.status || ""}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                ) : (
                  order.status
                )}
              </td>
              <td>
                <ul>
                  {(order.items || []).map((i, idx) => (
                    <li key={idx}>
                      {i.productName} × {i.quantity} — {i.price} €
                    </li>
                  ))}
                </ul>
              </td>
              {role === "ADMIN" && (
                <td>
                  <button
                    onClick={() => handleDelete(order.id)}
                    style={{
                      background: "#e63946",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }
        .orders-table th, .orders-table td {
          border: 1px solid #ccc;
          padding: 8px;
        }
        .orders-table th {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
}
