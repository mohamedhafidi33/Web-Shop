import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListProducts from "./components/ListProducts";
import Navbar from "./components/Navbar";
import ProductPage from "./components/ProductPage";
import React, { useState } from "react";
import CartSideBar from "./components/CartSideBar";
import PayementForm from "./components/PayementForm";
import ThankYouPage from "./components/ThankYouPage";
import HomePage from "./components/HomePage";

function App() {
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "Oversized Hoodie",
      description: "Soft fleece, relaxed fit",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Comfy Joggers",
      description: "Heavy cotton, baggy fit",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Street Cap",
      description: "Adjustable strap, clean logo",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      name: "Street Cap",
      description: "Adjustable strap, clean logo",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      name: "Street Cap",
      description: "Adjustable strap, clean logo",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    },
  ];

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
