import React from "react";
import { Link } from "react-router-dom";

function HomePage({ products, cart, setCart }) {
  const featured = Array.isArray(products) ? products.slice(0, 4) : [];
  const highlight = featured[0] || products?.[0];
  const second = featured[1] || products?.[1];

  const getImage = (p) =>
    p && p.imageUrl && p.imageUrl.trim() !== ""
      ? p.imageUrl
      : "https://images.unsplash.com/photo-1622428051717-dcd8412959de?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480";

  return (
    <div>
      {/* Lightweight styles for hover/overlay (scoped to this component) */}
      <style>{`
        .hover-raise { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-raise:hover { transform: translateY(-4px); box-shadow: 0 1rem 2rem rgba(0,0,0,.15)!important; }
        .img-cover { object-fit: cover; width: 100%; height: 100%; }
        .price-pill { position: absolute; bottom: .75rem; left: .75rem; }
        .bg-gradient-dark { background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.6)); }
      `}</style>

      {/* Hero Section */}
      <section
        className="position-relative text-white"
        style={{ minHeight: "70vh" }}
      >
        {/* Background image (static aesthetic) */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=2000&q=80'), url('https://images.unsplash.com/photo-1542060748-10c28b62716b?auto=format&fit=crop&w=2000&q=80'), url('https://via.placeholder.com/2000x900?text=Fashion+Collection')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.1) saturate(1.1)",
          }}
        />
        {/* Overlay */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-dark" />

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center" style={{ minHeight: "70vh" }}>
            <div className="col-12 col-lg-7 py-5">
              <span className="badge bg-light text-dark mb-3">New Drop</span>
              <h1 className="display-5 fw-bold mb-3">
                Streetwear that actually hits.
              </h1>
              <p className="lead mb-4 text-white-50">
                Oversized hoodies, baggy joggers, and clean caps — built for
                daily wear.
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

      {/* Collections Banner (uses product images) */}
      {(highlight || second) && (
        <section className="container py-5">
          <div className="row g-4">
            {highlight && (
              <div className="col-12 col-lg-8">
                <Link
                  to={`/product/${highlight.id}`}
                  className="text-decoration-none text-white"
                >
                  <div
                    className="position-relative rounded overflow-hidden shadow-sm hover-raise"
                    style={{ height: 320 }}
                  >
                    <img
                      src={getImage(highlight)}
                      alt={highlight.name}
                      className="img-cover"
                    />
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55))",
                      }}
                    />
                    <div className="position-absolute bottom-0 p-4">
                      <h3 className="h4 mb-1">{highlight.name}</h3>
                      <p className="text-white-50 mb-0">
                        {highlight.description || "Essential piece"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {second && (
              <div className="col-12 col-lg-4">
                <Link
                  to={`/product/${second.id}`}
                  className="text-decoration-none text-white"
                >
                  <div
                    className="position-relative rounded overflow-hidden shadow-sm hover-raise"
                    style={{ height: 320 }}
                  >
                    <img
                      src={getImage(second)}
                      alt={second.name}
                      className="img-cover"
                    />
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55))",
                      }}
                    />
                    <div className="position-absolute bottom-0 p-4">
                      <h3 className="h5 mb-1">{second.name}</h3>
                      <p className="text-white-50 mb-0">
                        {second.description || "From the latest drop"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products (dynamic) */}
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
              <Link
                to={`/product/${product.id}`}
                className="text-decoration-none text-dark"
              >
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
                    <p className="fw-semibold mt-2 mb-0">{product.price} €</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
