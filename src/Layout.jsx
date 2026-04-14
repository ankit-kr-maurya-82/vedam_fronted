import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar";
import UserContextProvider from "./context/UserContextProvider";
import { ThemeProvider } from "./context/theme";
import "./index.css";

const Layout = () => {
  const [themeMode, setThemeMode] = useState("light");
  const location = useLocation();

  // ✅ Pages jahan pura layout hide hoga
  const authRoutes = ["/login", "/register", "/admin-register"];
  const showLayout = !authRoutes.includes(location.pathname);

  // ✅ Footer hide logic (static + dynamic)
  const hideFooterRoutes = ["/login", "/home", "/explore", "/admin"];

  const hideFooter =
    hideFooterRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/profile/");

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setThemeMode(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeMode(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(themeMode);
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider value={{ themeMode, toggleTheme }}>
      <UserContextProvider>
        <div className={`app-shell ${showLayout ? "main-layout" : "auth-layout"}`}>

          {/* Header + Sidebar */}
          {showLayout && <Header />}
          {showLayout && <Sidebar />}

          {/* Main */}
          <main className={showLayout ? "app-main with-sidebar" : "app-main"}>
            <Outlet />
          </main>

          {/* Footer */}
          {!hideFooter && showLayout && <Footer />}

        </div>
      </UserContextProvider>
    </ThemeProvider>
  );
};

export default Layout;