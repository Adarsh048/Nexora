import React from 'react';

export const MountainIllustration = ({ careerGoal = 'Get your next offer' }) => {
  return (
    <div className="relative w-full md:w-[460px] lg:w-[500px] h-[125px] sm:h-[135px] md:h-[142px] rounded-3xl overflow-hidden select-none shrink-0 shadow-[0_10px_25px_-5px_rgba(118,82,232,0.12)] border border-[#DDD3FA] group">
      {/* Background Soft Sky Purple Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#9F82FB] via-[#C5B3FC] to-[#E3DAFD]" />

      {/* SVG Mountain Art from Reference Image */}
      <svg
        viewBox="0 0 500 142"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FFFFFF" floodOpacity="0.9" />
          </filter>
          <linearGradient id="peakFar" x1="280" y1="25" x2="440" y2="142" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8C6AF6" stopOpacity="0.75" />
            <stop offset="1" stopColor="#B69EF8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="peakMid" x1="330" y1="12" x2="490" y2="142" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7148E2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#9674F7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="peakSummit" x1="390" y1="6" x2="500" y2="142" gradientUnits="userSpaceOnUse">
            <stop stopColor="#552CBF" stopOpacity="0.98" />
            <stop offset="1" stopColor="#7B56E8" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Mountain Layer 1: Distant soft ridge */}
        <path
          d="M170 142 C 220 105, 260 65, 320 42 C 370 24, 410 70, 450 45 C 480 30, 500 50, 500 142 Z"
          fill="url(#peakFar)"
        />

        {/* Mountain Layer 2: Mid-ground mountain ridge */}
        <path
          d="M210 142 C 260 95, 300 55, 360 32 C 400 16, 435 50, 470 22 C 485 12, 495 18, 500 142 Z"
          fill="url(#peakMid)"
        />

        {/* Mountain Layer 3: Foreground Main Summit Peak */}
        <path
          d="M260 142 Q 330 80 390 65 T 450 18 Q 468 8 485 6 L 500 142 Z"
          fill="url(#peakSummit)"
        />

        {/* Glowing Winding Trail */}
        <path
          d="M205 132 Q 245 112 280 115 T 340 90 T 385 75 T 425 48 T 465 24 T 482 10"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="url(#pathGlow)"
        />

        {/* Hollow Circular Checkpoint Nodes along Trail */}
        <circle cx="205" cy="132" r="4.5" fill="#FFFFFF" filter="url(#pathGlow)" />
        <circle cx="280" cy="115" r="4.5" fill="#FFFFFF" filter="url(#pathGlow)" />
        <circle cx="340" cy="90" r="5" fill="#FFFFFF" filter="url(#pathGlow)" />
        <circle cx="385" cy="75" r="5" fill="#FFFFFF" filter="url(#pathGlow)" />
        <circle cx="425" cy="48" r="5.5" fill="#FFFFFF" filter="url(#pathGlow)" />
        <circle cx="465" cy="24" r="5.5" fill="#FFFFFF" filter="url(#pathGlow)" />

        {/* Summit Flagpole & Violet Flag */}
        <line x1="482" y1="10" x2="482" y2="-2" stroke="#2D1577" strokeWidth="2" strokeLinecap="round" />
        <path d="M482 -2 L497 3 L482 8 Z" fill="#653EE6" stroke="#FFFFFF" strokeWidth="0.8" />
        <circle cx="482" cy="10" r="6" fill="#653EE6" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>

      {/* Floating Career Goal Card (Exact visual from reference image) */}
      <div className="absolute top-2.5 left-3 sm:top-3.5 sm:left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-[0_4px_16px_rgba(30,26,60,0.08)] border border-white/90">
        <p className="text-[10px] sm:text-[11px] font-semibold text-[#74748C] tracking-wide">Career Goal</p>
        <p className="text-xs sm:text-[13px] font-black text-[#17172F] flex items-center space-x-1.5 mt-0.5">
          <span className="truncate max-w-[170px] sm:max-w-none">{careerGoal}</span>
          <span className="text-xs">🎯</span>
        </p>
      </div>
    </div>
  );
};

export default MountainIllustration;
