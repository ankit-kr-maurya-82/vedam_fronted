import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UserContext from "./UserContext";
import api from "../api/axios.js";
import {
  getCurrentUser,
  logoutLocalUser,
  syncUserToStore,
} from "../lib/socialStore";

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    logout: auth0Logout,
  } = useAuth0();

  const logout = () => {
    setUser(null);
    logoutLocalUser();

    if (isAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo:
            import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
        },
      });
    }
  };

  useEffect(() => {
    if (auth0Loading || isAuthenticated) {
      return;
    }

    const storedUser = getCurrentUser();
    const accessToken = window.localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      setUser(syncUserToStore(storedUser));
    } else if (storedUser && !accessToken) {
      logoutLocalUser();
    }

    setLoading(false);
  }, [auth0Loading, isAuthenticated]);

  useEffect(() => {
    if (auth0Loading || !isAuthenticated || !auth0User?.email) {
      return;
    }

    let ignore = false;

    const syncAuth0User = async () => {
      setLoading(true);

      try {
        const emailPrefix = auth0User.email.split("@")[0] || "user";
        const fallbackName = auth0User.name || emailPrefix;
        const derivedUsername =
          auth0User.nickname ||
          fallbackName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

        const response = await api.post("/users/social-login", {
          email: auth0User.email,
          fullName: fallbackName,
          username: derivedUsername,
          avatar: auth0User.picture || "",
          authProvider: auth0User.sub?.startsWith("google-oauth2|")
            ? "google"
            : "auth0",
          authProviderId: auth0User.sub || "",
        });

        if (ignore) {
          return;
        }

        const { user: nextUser, accessToken } = response.data.data;
        const syncedUser = syncUserToStore(nextUser);

        window.localStorage.setItem("accessToken", accessToken);
        window.localStorage.setItem("user", JSON.stringify(syncedUser));
        setUser(syncedUser);
      } catch (error) {
        if (!ignore) {
          console.error(
            "Auth0 user sync failed",
            error.response?.data?.message || error.message
          );
          logoutLocalUser();
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    syncAuth0User();

    return () => {
      ignore = true;
    };
  }, [auth0Loading, isAuthenticated, auth0User, auth0Logout]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
