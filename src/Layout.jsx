import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar";
import UserContextProvider from "./context/UserContextProvider";
import { ThemeProvider } from "./context/theme";
import "./index.css"

const Layout = () => {
  const [themeMode, setThemeMode] = useState("light");
  const location = useLocation();

  const hideHeader =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setThemeMode(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(themeMode);
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider value={{ themeMode, toggleTheme }}>
      <UserContextProvider>
        <div className={`app-shell ${hideHeader ? "auth-shell" : ""}`}>
          {!hideHeader && <Header />}
          {!hideHeader && <Sidebar />}

          <main className={!hideHeader ? "app-main with-sidebar" : "app-main"}>
            <Outlet />
          </main>
        </div>
      </UserContextProvider>
    </ThemeProvider>
  );
};

export default Layout;
