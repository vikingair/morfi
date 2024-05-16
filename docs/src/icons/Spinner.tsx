import React from "react";

export const Spinner = () => (
  <svg className="spinner" viewBox="0 0 100 100">
    <defs>
      <clipPath id="rects">
        <rect x="0" y="0" width="43" height="100" />
        <rect x="57" y="0" width="43" height="100" />
        <rect x="0" y="50" width="100" height="50" />
      </clipPath>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="currentColor"
      strokeWidth="10"
      fill="none"
      clipPath="url(#rects)"
    />
  </svg>
);
