import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ListProducts from "./components/ListProducts";
import Navbar from "./components/Navbar";
import ProductPage from "./components/ProductPage";
import React, { useState, useEffect } from "react";
import CartSideBar from "./components/CartSideBar";
import PayementForm from "./components/PayementForm";
import ThankYouPage from "./components/ThankYouPage";
import HomePage from "./components/HomePage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import ProductsListPage from "./components/ProductsListPage";
import ProductUpdatePage from "./components/ProductUpdatePage";
import CustomerProfile from "./components/CustomerProfile";
import CreateProduct from "./components/CreateProduct";
import PurchaseHistoryPage from "./components/PurchaseHistoryPage";
import CustomerList from "./components/CustomerList";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  if (!token || role !== "ADMIN") {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function App() {
  const [cart, setCart] = useState([]);

  const [products, setProducts] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

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
        <Route path="/products/list" element={<ProductsListPage />} />
        <Route path="/products/:id" element={<ProductUpdatePage />} />
        <Route path="/products/new" element={<CreateProduct />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/orders" element={<PurchaseHistoryPage />} />
        <Route
          path="/checkout"
          element={<PayementForm cart={cart} setCart={setCart} />}
        />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
