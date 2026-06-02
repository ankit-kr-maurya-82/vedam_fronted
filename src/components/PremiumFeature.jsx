import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import UserContext from "../context/UserContext";
import "./CSS/PremiumFeature.css";

/**
 * PremiumFeature Component
 * Wraps premium-only features and shows upgrade prompt if user isn't premium
 * 
 * @param {React.ReactNode} children - Content to display if user is premium
 * @param {string} featureName - Name of the premium feature (e.g., "Analytics")
 * @param {boolean} hideCompletely - If true, hides the feature entirely instead of showing lock
 */
const PremiumFeature = ({ children, featureName = "Feature", hideCompletely = false }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const isPremium = user?.subscription?.plan === "premium" && user?.subscription?.isActive;

  // If not premium and hideCompletely is true, return null
  if (!isPremium && hideCompletely) {
    return null;
  }

  // If premium, render children
  if (isPremium) {
    return children;
  }

  // Show locked state with upgrade prompt
  return (
    <div className="premium-feature-locked">
      <div className="premium-feature-overlay">
        <FaLock className="premium-lock-icon" />
        <h3>{featureName} is Premium</h3>
        <p>Upgrade to premium to unlock {featureName}</p>
        <button
          className="premium-upgrade-cta"
          onClick={() => navigate("/analytics")}
        >
          Upgrade Now - ₹99/month
        </button>
      </div>
      <div className="premium-feature-blur">{children}</div>
    </div>
  );
};

export default PremiumFeature;
