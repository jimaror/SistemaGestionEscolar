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
            <stop offset="0%" stopColor="#001233" stopOpacity={1} />
            <stop offset="25%" stopColor="#002466" stopOpacity={0.95} />
            <stop offset="50%" stopColor="#003999" stopOpacity={0.85} />
            <stop offset="75%" stopColor="#0052cc" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#001a4d" stopOpacity={0.95} />
            <stop offset="25%" stopColor="#002d7d" stopOpacity={0.9} />
            <stop offset="50%" stopColor="#0047b3" stopOpacity={0.75} />
            <stop offset="75%" stopColor="#3377ff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#002d7d" stopOpacity={0.85} />
            <stop offset="25%" stopColor="#0047b3" stopOpacity={0.75} />
            <stop offset="50%" stopColor="#1a66cc" stopOpacity={0.6} />
            <stop offset="75%" stopColor="#6699ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientWave4" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0047b3" stopOpacity={0.7} />
            <stop offset="25%" stopColor="#1a66cc" stopOpacity={0.6} />
            <stop offset="50%" stopColor="#4080ff" stopOpacity={0.45} />
            <stop offset="75%" stopColor="#99bbff" stopOpacity={0.2} />
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