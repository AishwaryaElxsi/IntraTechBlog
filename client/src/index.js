import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BlogProvider } from "./state/BlogContext";

// Import app-wide CSS (optional)
import "./index.css";

// Render the root app, using provider for in-memory store
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BlogProvider>
      <App />
    </BlogProvider>
  </React.StrictMode>
);
