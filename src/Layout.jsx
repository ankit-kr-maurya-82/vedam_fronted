import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar";
import ThemeBtn from "./components/ThemeBtn";
import UserContext from "./context/UserContext";
import UserContextProvider from "./context/UserContextProvider";
import { ThemeProvider } from "./context/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const LayoutContent = ({ showLayout, themeMode }) => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const showSidebar = showLayout && Boolean(user);

  const hideFooterRoutes = ["/login", "/home", "/explore", "/admin"];
  const hideFooter =
    Boolean(user) ||
    hideFooterRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/profile/");

  return (
    <div className={`app-shell ${showLayout ? "main-layout" : "auth-layout"}`}>
      {showLayout && <Header />}
      {showSidebar && <Sidebar />}

      <main className={showSidebar ? "app-main with-sidebar" : "app-main"}>
        <Outlet />
      </main>

      {!hideFooter && showLayout && <Footer />}
      <ThemeBtn />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={themeMode}
      />
    </div>
  );
};

const Layout = () => {
  const [themeMode, setThemeMode] = useState("light");
  const location = useLocation();

  const authRoutes = ["/login", "/register", "/admin-register"];
  const showLayout = !authRoutes.includes(location.pathname);

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
        <LayoutContent showLayout={showLayout} themeMode={themeMode} />
      </UserContextProvider>
    </ThemeProvider>
  );
};

export default Layout;
