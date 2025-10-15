import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignedIn, setIsSignedIn] = useState(
    !!localStorage.getItem("authToken")
  );
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Keep auth state in sync with localStorage (cross‑tab), custom events, and window focus
  useEffect(() => {
    const refreshAuth = () => {
      const token = localStorage.getItem("authToken");
      const storedRole = localStorage.getItem("role");
      setIsSignedIn(!!token);
      setRole(storedRole);
    };
    const onVisibility = () => {
      if (!document.hidden) refreshAuth();
    };

    refreshAuth();
    window.addEventListener("storage", refreshAuth);
    window.addEventListener("auth-changed", refreshAuth);
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshAuth);

    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("auth-changed", refreshAuth);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshAuth);
    };
  }, []);

  useEffect(() => {
    // Re-evaluate auth state on every route change so Navbar updates without a manual refresh
    const token = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");
    setIsSignedIn(!!token);
    setRole(storedRole);
  }, [location.pathname]);

  const handleSignOut = () => {
    // Clear minimal auth-related keys; keep it simple as requested
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("customer");
    window.dispatchEvent(new Event("auth-changed"));
    setIsSignedIn(false);
    navigate("/signin");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold text-uppercase" to="/">
          <span style={{ letterSpacing: "1px" }}>WebShop</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
            <li className="nav-item">
              <Link className="nav-link text-white fw-semibold" to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-white fw-semibold" to="/products">
                <i className="bi bi-bag me-1"></i> Shop
              </Link>
            </li>

            {isSignedIn && role === "CUSTOMER" && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white fw-semibold"
                    to="/orders"
                  >
                    <i className="bi bi-person-circle me-1"></i> My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white fw-semibold"
                    to="/profile"
                  >
                    <i className="bi bi-person-circle me-1"></i> My Profile
                  </Link>
                </li>
              </>
            )}

            {isSignedIn && role === "ADMIN" && (
              <li className="nav-item">
                <Link
                  className="nav-link text-white fw-semibold"
                  to="/products/list"
                >
                  <i className="bi bi-tools me-1"></i> Manage Products
                </Link>
              </li>
            )}

            {!isSignedIn && (
              <li className="nav-item">
                <Link className="nav-link text-white fw-semibold" to="/signin">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
              </li>
            )}

            {isSignedIn && (
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-outline-light fw-semibold px-3 ms-lg-2"
                  onClick={handleSignOut}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Sign Out
                </button>
              </li>
            )}

            <li className="nav-item">
              <button
                type="button"
                className="btn btn-outline-light fw-semibold px-3 ms-lg-3"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartSidebar"
                aria-controls="cartSidebar"
              >
                <i className="bi bi-cart3 me-1"></i> Cart
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
