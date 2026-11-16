"use client";

export function WavesBackground({ className }: { className?: string }) {
  return (
    <div
      className={className ? `waves-container ${className}` : "waves-container"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradientWave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.92} />
            <stop offset="8%" stopColor="#e0f2fe" stopOpacity={0.85} />
            <stop offset="30%" stopColor="#1e40af" stopOpacity={0.9} />
            <stop offset="65%" stopColor="#0b2a5e" stopOpacity={1} />
            <stop offset="100%" stopColor="#020617" stopOpacity={1} />
          </linearGradient>

          <linearGradient id="gradientWave2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.86} />
            <stop offset="8%" stopColor="#bae6fd" stopOpacity={0.8} />
            <stop offset="30%" stopColor="#1d4ed8" stopOpacity={0.9} />
            <stop offset="65%" stopColor="#0a2456" stopOpacity={1} />
            <stop offset="100%" stopColor="#020617" stopOpacity={1} />
          </linearGradient>

          <linearGradient id="gradientWave3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
            <stop offset="8%" stopColor="#7dd3fc" stopOpacity={0.78} />
            <stop offset="30%" stopColor="#2563eb" stopOpacity={0.9} />
            <stop offset="65%" stopColor="#082048" stopOpacity={1} />
            <stop offset="100%" stopColor="#020617" stopOpacity={1} />
          </linearGradient>

          <linearGradient id="gradientWave4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.72} />
            <stop offset="8%" stopColor="#bae6fd" stopOpacity={0.7} />
            <stop offset="30%" stopColor="#1d4ed8" stopOpacity={0.9} />
            <stop offset="65%" stopColor="#071d42" stopOpacity={1} />
            <stop offset="100%" stopColor="#020617" stopOpacity={1} />
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