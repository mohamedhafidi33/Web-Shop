import React, { useEffect, useState } from "react";

export default function PurchaseHistoryPage() {
  const [orders, setOrders] = useState([]);

  const customer = JSON.parse(localStorage.getItem("customer"));

  useEffect(() => {
    if (!customer || !customer.id) return;
    const token = localStorage.getItem("authToken");
    fetch(`http://localhost:8080/orders/customer/${customer.id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  if (!customer) {
    return <p>Please sign in first.</p>;
  }

  return (
    <div className="container mt-5">
      <h2>Purchase History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="list-group">
          {orders.map((order) => (
            <li key={order.id} className="list-group-item">
              <h5>Order #{order.id}</h5>
              <ul>
                {(order.items || []).map((item) => (
                  <li key={item.id}>
                    {item.productName} - €{item.price} (x
                    {item.quantity})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
