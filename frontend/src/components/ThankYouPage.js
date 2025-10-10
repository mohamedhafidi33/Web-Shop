
import React from "react";
import { Link } from "react-router-dom";

function ThankYouPage() {
  return (
    <div className="container py-5 d-flex flex-column align-items-center text-center">
      <div className="mb-3" style={{ fontSize: "3rem" }}>🎉</div>
      <h1 className="mb-2">Thank you for your order!</h1>
      <p className="text-muted mb-4">
        Your purchase was successful. A confirmation email has been sent to you.
      </p>
      <Link to="/" className="btn btn-dark">Back to shop</Link>
    </div>
  );
}

export default ThankYouPage;