import * as React from 'react';

export const SavoraLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="200"
    height="50"
    {...props}
  >
    <style>
      {
        ".savora-text { font-family: 'Inter', sans-serif; font-size: 40px; font-weight: 800; fill: hsl(var(--primary)); letter-spacing: -2px; }"
      }
    </style>
    <text x="0" y="40" className="savora-text">
      Savora
    </text>
  </svg>
);
