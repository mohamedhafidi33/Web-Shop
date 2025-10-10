import React from "react";
import { Link } from "react-router-dom";

function ListProducts({ products, cart, setCart }) {
  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item
      );
      setCart(updated);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };
  return (
    <>
      <style>{`
        .hover-raise { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-raise:hover { transform: translateY(-4px); box-shadow: 0 1rem 2rem rgba(0,0,0,.15)!important; }
        .hover-raise img { transition: transform .25s ease; }
        .hover-raise:hover img { transform: scale(1.03); }
      `}</style>
      <div className="container py-5">
        <h1 className="text-center mb-4">Our Products</h1>
        <div className="row g-4">
          {products.map((p) => (
            <div className="col-12 col-sm-6 col-md-4" key={p.id}>
              <Link
                to={`/product/${p.id}`}
                state={p}
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 shadow-sm hover-raise">
                  <img
                    src={p.image}
                    className="card-img-top"
                    alt={p.name}
                    style={{ height: 240, objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="text-muted small">{p.description}</p>
                    <p className="fw-bold">{p.price} €</p>
                    <button
                      className="btn btn-dark"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(p);
                        const sidebar = document.getElementById("cartSidebar");
                        if (sidebar) {
                          const bsOffcanvas = new window.bootstrap.Offcanvas(
                            sidebar
                          );
                          bsOffcanvas.show();
                        }
                      }}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ListProducts;
