import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
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
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(orders.filter((o) => o.id !== id));
  }

  async function handleStatusChange(id, newStatus) {
    await fetch(`${API_BASE}/orders/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName}</td>
              <td>${order.totalAmount?.toFixed(2)}</td>
              <td>
                <select
                  value={order.status || ""}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </td>
              <td>
                <ul>
                  {order.items.map((i, idx) => (
                    <li key={idx}>
                      {i.productName} × {i.quantity} — ${i.price}
                    </li>
                  ))}
                </ul>
              </td>
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
