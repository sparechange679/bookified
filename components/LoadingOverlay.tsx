import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper">
        <div className="loading-shadow">
          <Loader2 className="loading-animation text-brand w-12 h-12" />
          <h2 className="loading-title">Synthesizing Your Book</h2>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <div className="loading-progress-status" />
              <p className="text-[var(--text-secondary)]">Analyzing PDF content...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
