import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.dataset.prerendered === 'true' && window.location.pathname === '/') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
