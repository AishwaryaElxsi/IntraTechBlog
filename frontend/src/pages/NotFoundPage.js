import React from "react";

// PUBLIC_INTERFACE
/**
 * 404 Not Found Page (handles unmatched routes).
 */
function NotFoundPage() {
  return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <h1>404 – Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFoundPage;
