/**
 * Escudo nacional de Nicaragua (versión estilizada).
 *
 * Triángulo dorado con los cinco volcanes, el arcoíris, el gorro frigio
 * radiante y el aro dorado, inspirado en el escudo oficial que lleva la
 * bandera de Nicaragua. Se dibuja con SVG propio para no depender de
 * imágenes externas y escala a cualquier tamaño vía className.
 */
export function EscudoNicaragua({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Escudo de Nicaragua"
    >
      <defs>
        <clipPath id="escudo-nic-triangulo">
          <path d="M60 14 L109 100 L11 100 Z" />
        </clipPath>
      </defs>

      {/* Aro dorado exterior */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="#E8B94A" strokeWidth="3" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#E8B94A"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Interior del triángulo (recortado a sus bordes) */}
      <g clipPath="url(#escudo-nic-triangulo)">
        {/* Cielo */}
        <rect x="0" y="0" width="120" height="120" fill="#CFE6F8" />

        {/* Resplandor del gorro frigio */}
        <ellipse cx="60" cy="43" rx="15" ry="11" fill="#FFF6D8" opacity="0.9" />

        {/* Gorro frigio rojo */}
        <path
          d="M60 34 C 51 36 46 45 49 52 L 71 52 C 74 45 69 36 60 34 Z"
          fill="#C8102E"
        />

        {/* Arcoíris */}
        <path
          d="M15 101 A 45 45 0 0 1 105 101"
          fill="none"
          stroke="#C8102E"
          strokeWidth="3.5"
        />
        <path
          d="M22 101 A 38 38 0 0 1 98 101"
          fill="none"
          stroke="#F59E3B"
          strokeWidth="3.5"
        />
        <path
          d="M29 101 A 31 31 0 0 1 91 101"
          fill="none"
          stroke="#F2D23B"
          strokeWidth="3.5"
        />
        <path
          d="M36 101 A 24 24 0 0 1 84 101"
          fill="none"
          stroke="#3FA65C"
          strokeWidth="3.5"
        />

        {/* Cinco volcanes */}
        <path d="M2 100 L24 72 L46 100 Z" fill="#2E7D4F" />
        <path d="M28 100 L46 79 L64 100 Z" fill="#3C8F5F" />
        <path d="M50 100 L68 73 L86 100 Z" fill="#2E7D4F" />
        <path d="M68 100 L84 81 L100 100 Z" fill="#3C8F5F" />
        <path d="M84 100 L100 75 L116 100 Z" fill="#2E7D4F" />

        {/* Mar al pie de los volcanes */}
        <rect x="0" y="92" width="120" height="8" fill="#2C6FB8" opacity="0.6" />
      </g>

      {/* Borde dorado del triángulo, encima del recorte */}
      <path
        d="M60 14 L109 100 L11 100 Z"
        fill="none"
        stroke="#E8B94A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
