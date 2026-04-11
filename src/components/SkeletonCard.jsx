import React from "react";
import "./skeleton.css";

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      {/* Header */}
      <div className="skeleton-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="skeleton-lines">
          <div className="skeleton-line short shimmer"></div>
          <div className="skeleton-line tiny shimmer"></div>
        </div>
      </div>

      {/* Content */}
      <div className="skeleton-body">
        <div className="skeleton-line shimmer"></div>
        <div className="skeleton-line shimmer"></div>
        <div className="skeleton-line medium shimmer"></div>
      </div>

      {/* Actions */}
      <div className="skeleton-actions">
        <div className="skeleton-btn shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
