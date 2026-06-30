import React from "react";

interface CivicIqLogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showSubtext?: boolean;
}

export default function CivicIqLogo({
  variant = "dark",
  size = "md",
  showSubtext = true,
}: CivicIqLogoProps) {
  // Color presets
  const textColor = variant === "dark" ? "text-[#0F172A]" : "text-white";
  const subtextColor = variant === "dark" ? "text-[#475569]" : "text-slate-300";

  // Size configurations
  const titleSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const subtitleSizes = {
    sm: "text-[7px]",
    md: "text-[9px] tracking-[0.16em]",
    lg: "text-[11px] tracking-[0.2em]",
  };

  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  };

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* Dynamic High-Tech Map Pin + Circuit Shield SVG Icon */}
      <div className={`relative shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(29,155,240,0.2)]"
        >
          {/* Circuit Trace Lines (glowing blue background) */}
          <path
            d="M8 20h12M4 32h14M8 44h10M12 20v24"
            stroke="#1D9BF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-70 group-hover:stroke-[#00C2FF] transition-colors"
          />
          {/* Circuit Connection Nodes (small dots) */}
          <circle cx="8" cy="20" r="2" fill="#1D9BF0" className="group-hover:fill-[#00C2FF] transition-colors" />
          <circle cx="4" cy="32" r="2" fill="#1D9BF0" className="group-hover:fill-[#00C2FF] transition-colors" />
          <circle cx="8" cy="44" r="2" fill="#1D9BF0" className="group-hover:fill-[#00C2FF] transition-colors" />

          {/* Connected diagonal circuit traces to Pin */}
          <path
            d="M20 20l6 6M18 32h8M18 44l6-6"
            stroke="#1D9BF0"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-60"
          />

          {/* Outer glowing halo */}
          <circle
            cx="38"
            cy="32"
            r="18"
            stroke="#1D9BF0"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-40 animate-spin"
            style={{ animationDuration: "20s" }}
          />

          {/* Main Pin Shape */}
          <path
            d="M38 12c-8.8 0-16 7.2-16 16 0 11.2 13.8 22.8 15 23.8a1.5 1.5 0 002 0c1.2-1 15-12.6 15-23.8 0-8.8-7.2-16-16-16z"
            fill="url(#pin-grad)"
            stroke="#1D9BF0"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Shield Inlay with Checkmark inside the Pin */}
          <path
            d="M38 20c-3.3 0-5.5 1.2-5.5 1.2v4.8c0 3.3 2.2 6.4 5.5 7.4 3.3-1 5.5-4.1 5.5-7.4v-4.8s-2.2-1.2-5.5-1.2z"
            fill="#0F172A"
            stroke="#00C2FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Glowing Checkmark */}
          <path
            d="M35.5 25.5l1.5 1.5 3-3"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />

          {/* Defs for nice gradients */}
          <defs>
            <linearGradient id="pin-grad" x1="22" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text Stack */}
      <div className="flex flex-col justify-center select-none">
        <h1 className={`font-display ${titleSizes[size]} font-black tracking-tight leading-none ${textColor}`}>
          Civic<span className="text-[#1D9BF0] group-hover:text-[#00C2FF] transition-colors">IQ</span>
        </h1>
        {showSubtext && (
          <span className={`font-mono ${subtitleSizes[size]} ${subtextColor} uppercase font-extrabold tracking-wider mt-1 block leading-none`}>
            AI-Powered Civic Intelligence Platform
          </span>
        )}
      </div>
    </div>
  );
}
