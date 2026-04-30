import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Auth0ProviderWithNavigate from "./Auth0ProviderWithNavigate.jsx";
import PWAContextProvider from "./context/PWAContextProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PWAContextProvider>
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      </PWAContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
