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
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
            <stop offset="12%" stopColor="#bae6fd" stopOpacity={0.35} />
            <stop offset="45%" stopColor="#1d4ed8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
            <stop offset="12%" stopColor="#bae6fd" stopOpacity={0.4} />
            <stop offset="45%" stopColor="#2563eb" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.88} />
            <stop offset="12%" stopColor="#e0f2fe" stopOpacity={0.45} />
            <stop offset="45%" stopColor="#3b82f6" stopOpacity={0.36} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <path className="wave-1" d="M0,175 C150,125 350,225 600,175 C850,125 1050,225 1200,175 L1200,320 L0,320 Z" />
        <path className="wave-2" d="M0,215 C200,165 400,265 600,215 C800,165 1000,265 1200,215 L1200,320 L0,320 Z" />
        <path className="wave-3" d="M0,250 C180,205 380,290 600,250 C820,205 1020,290 1200,250 L1200,320 L0,320 Z" />
      </svg>
    </div>
  );
}
