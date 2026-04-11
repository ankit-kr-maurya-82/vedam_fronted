import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import App from "./App.jsx";

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        // ✅ BEST: auto works for local + production
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || "/home", { replace: true });
      }}
      cacheLocation="localstorage"   // ✅ keeps user logged in
      useRefreshTokens={true}        // ✅ prevents logout issues
    >
      {children}
    </Auth0Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </React.StrictMode>
);