import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListProducts from "./components/ListProducts";
import Navbar from "./components/Navbar";
import ProductPage from "./components/ProductPage";
import React, { useState, useEffect } from "react";
import CartSideBar from "./components/CartSideBar";
import PayementForm from "./components/PayementForm";
import ThankYouPage from "./components/ThankYouPage";
import HomePage from "./components/HomePage";

function App() {
  const [cart, setCart] = useState([]);

  const [products, setProducts] = useState([]);
  const API_BASE =
    process.env.NODE_ENV === "development" ? "http://localhost:8080" : "";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content || [];
        setProducts(list);
      } catch (e) {
        console.error(e);
        setProducts([]);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <CartSideBar cart={cart} setCart={setCart} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage products={products} cart={cart} setCart={setCart} />
          }
        />
        <Route
          path="/products"
          element={
            <ListProducts products={products} cart={cart} setCart={setCart} />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductPage products={products} cart={cart} setCart={setCart} />
          }
        />
        <Route
          path="/checkout"
          element={<PayementForm cart={cart} setCart={setCart} />}
        />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
