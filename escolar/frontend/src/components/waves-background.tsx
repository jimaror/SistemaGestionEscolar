"use client";

export function WavesBackground({ className }: { className?: string }) {
  return (
    <div
      className={className ? `waves-container ${className}` : "waves-container"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradientWave1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.24} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.09} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave4" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>

        <path className="wave-1" d="M0,180 C150,130 350,230 600,180 C850,130 1050,230 1200,180 L1200,320 L0,320 Z" />
        <path className="wave-2" d="M0,210 C200,160 400,260 600,210 C800,160 1000,260 1200,210 L1200,320 L0,320 Z" />
        <path className="wave-3" d="M0,240 C180,190 380,280 600,240 C820,190 1020,280 1200,240 L1200,320 L0,320 Z" />
        <path className="wave-4" d="M0,265 C220,220 420,295 600,265 C780,220 980,295 1200,265 L1200,320 L0,320 Z" />
      </svg>

      <div className="sombra-base" />
    </div>
  );
}