import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "../context/theme";
import "./CSS/ThemeBtn.css";

const ThemeBtn = () => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      className="theme-fab"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="theme-fab__icon">
        {isDark ? <FaSun /> : <FaMoon />}
      </span>
      {/* <span className="theme-fab__text">
        {isDark ? "" : ""}
      </span> */}
    </button>
  );
};

export default ThemeBtn;
