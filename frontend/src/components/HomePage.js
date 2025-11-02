import React from "react";
import { Link } from "react-router-dom";

const HERO_IMG_URL =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop";

function HomePage({ products, cart, setCart, setProducts }) {
  const featured = Array.isArray(products) ? products.slice(0, 4) : [];
  const highlight = featured[0] || products?.[0];
  const second = featured[1] || products?.[1];

  const getImage = (p) =>
    p && p.imageUrl && p.imageUrl.trim() !== ""
      ? p.imageUrl
      : "https://images.unsplash.com/photo-1622428051717-dcd8412959de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480";

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;

    // Add product to cart
    setCart([...cart, product]);

    // Decrease stock in products array
    const updatedProducts = products.map((p) =>
      p.id === product.id ? { ...p, stock: p.stock - 1 } : p
    );

    if (typeof setProducts === "function") {
      setProducts(updatedProducts);
    }
  };

  return (
    <div>
      {/* Styles */}
      <style>{`
        .hover-raise { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-raise:hover { transform: translateY(-4px); box-shadow: 0 1rem 2rem rgba(0,0,0,.15)!important; }
        .img-cover { object-fit: cover; width: 100%; height: 100%; }
        .hero { min-height: 82vh; }
        @media (max-width: 768px) { .hero { min-height: 65vh; } }
        .stock-text { font-weight: bold; margin-bottom: 0.3rem; }
      `}</style>

      {/* Hero Section */}
      <section
        className="position-relative text-white hero"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url('${HERO_IMG_URL}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.1) saturate(1.1)",
          }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75" />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center" style={{ minHeight: "82vh" }}>
            <div className="col-12 col-lg-7 py-5">
              <span className="badge bg-light text-dark mb-3">New in Tech</span>
              <h1 className="display-4 fw-bold mb-3">
                Gear that elevates your setup.
              </h1>
              <p className="fs-5 mb-4 text-white-50">
                Precision mice, mechanical keyboards, and sleek accessories —
                built for performance, durability, and style.
              </p>
              <Link to="/products" className="btn btn-light btn-lg me-2">
                Shop now
              </Link>
              {highlight && (
                <Link
                  to={`/product/${highlight.id}`}
                  className="btn btn-outline-light btn-lg"
                >
                  View featured
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Collections Banner */}
      {(highlight || second) && (
        <section className="container py-5">
          <div className="row g-4">
            {highlight && (
              <div className="col-12 col-lg-8">
                <div className="position-relative rounded overflow-hidden shadow-sm hover-raise">
                  <img
                    src={getImage(highlight)}
                    alt={highlight.name}
                    className="img-cover"
                    style={{ height: 320 }}
                  />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55))",
                    }}
                  />
                  <div className="position-absolute bottom-0 p-4 text-white">
                    <h3 className="h4 mb-1">{highlight.name}</h3>
                    <p className="text-white-50 mb-1">
                      {highlight.description || "Essential piece"}
                    </p>

                    {/* ✅ Clear Stock Display */}
                    <p
                      className="stock-text"
                      style={{
                        color: highlight.stock === 0 ? "red" : "lightgreen",
                      }}
                    >
                      {highlight.stock === 0
                        ? "Out of Stock"
                        : `In Stock (${highlight.stock})`}
                    </p>

                    <button
                      className="btn btn-sm btn-light"
                      disabled={highlight.stock === 0}
                      onClick={() => handleAddToCart(highlight)}
                    >
                      {highlight.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {second && (
              <div className="col-12 col-lg-4">
                <div className="position-relative rounded overflow-hidden shadow-sm hover-raise">
                  <img
                    src={getImage(second)}
                    alt={second.name}
                    className="img-cover"
                    style={{ height: 320 }}
                  />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55))",
                    }}
                  />
                  <div className="position-absolute bottom-0 p-4 text-white">
                    <h3 className="h5 mb-1">{second.name}</h3>
                    <p className="text-white-50 mb-1">
                      {second.description || "From the latest drop"}
                    </p>

                    {/* ✅ Clear Stock Display */}
                    <p
                      className="stock-text"
                      style={{
                        color: second.stock === 0 ? "red" : "lightgreen",
                      }}
                    >
                      {second.stock === 0
                        ? "Out of Stock"
                        : `In Stock (${second.stock})`}
                    </p>

                    <button
                      className="btn btn-sm btn-light"
                      disabled={second.stock === 0}
                      onClick={() => handleAddToCart(second)}
                    >
                      {second.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container pb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h4 m-0">Featured Products</h2>
          <Link to="/products" className="btn btn-outline-dark btn-sm">
            View all
          </Link>
        </div>
        <div className="row g-4">
          {featured.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm h-100 position-relative hover-raise">
                <img
                  src={getImage(product)}
                  alt={product.name}
                  className="card-img-top"
                  style={{ height: 240, objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title mb-1">{product.name}</h5>
                  {product.description && (
                    <p className="text-muted small mb-0">
                      {product.description}
                    </p>
                  )}
                  <p className="fw-semibold mt-2 mb-1">{product.price} €</p>

                  {/* ✅ Clear Stock Display */}
                  <p
                    className="stock-text"
                    style={{
                      color: product.stock === 0 ? "red" : "green",
                    }}
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : `In Stock (${product.stock})`}
                  </p>

                  <button
                    className="btn btn-sm btn-outline-dark mt-2"
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
