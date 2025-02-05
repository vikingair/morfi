import React from "react";

export const Eye = ({ stroked }: { stroked: boolean }) => (
  <svg className="eye" color="currentColor" viewBox="0 0 8 8">
    <path
      d="M4.03 0c-2.53 0-4.03 3-4.03 3s1.5 3 4.03 3c2.47 0 3.97-3 3.97-3s-1.5-3-3.97-3zm-.03 1c1.11 0 2 .9 2 2 0 1.11-.89 2-2 2-1.1 0-2-.89-2-2 0-1.1.9-2 2-2zm0 1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.04-.19-.06-.28-.08.16-.24.28-.44.28-.28 0-.5-.22-.5-.5 0-.2.12-.36.28-.44-.09-.03-.18-.06-.28-.06z"
      transform="translate(0 1)"
    />
    {stroked && <line x1="0" y1="8" x2="8" y2="0" stroke="currentColor" />}
  </svg>
);
