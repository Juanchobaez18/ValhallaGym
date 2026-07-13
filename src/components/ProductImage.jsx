import React from 'react';

export default function ProductImage({ id, size = 180 }) {
  // Renders a high-quality stylized SVG based on the product ID using Norse variables (teal, wood, steel)
  switch (id) {
    case 'prod-1': // Elixir de Odín (Pre-Workout)
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-elixir" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121316" />
              <stop offset="100%" stopColor="#08090a" />
            </linearGradient>
            <linearGradient id="grad-teal-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-teal-bright)" />
              <stop offset="100%" stopColor="var(--color-teal)" />
            </linearGradient>
          </defs>
          <rect x="55" y="40" width="90" height="120" rx="6" fill="url(#grad-elixir)" stroke="var(--color-teal)" strokeWidth="2.5" />
          <rect x="65" y="24" width="70" height="16" rx="2" fill="#16181d" stroke="var(--color-teal-bright)" strokeWidth="1.5" />
          {/* Label */}
          <rect x="60" y="60" width="80" height="50" rx="1.5" fill="var(--color-teal-dim)" stroke="var(--color-teal)" strokeWidth="1" />
          {/* Runes on label */}
          <path d="M75 75 L80 80 M80 80 L85 75 M80 80 V90" stroke="var(--color-teal-bright)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M100 75 V90 M100 75 L105 80 M100 80 L105 85" stroke="var(--color-teal-bright)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M120 75 V90 M120 75 L115 82 M120 82 H115" stroke="var(--color-teal-bright)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Glow details */}
          <circle cx="100" cy="140" r="4.5" fill="var(--color-teal-bright)" style={{ filter: 'drop-shadow(0 0 4px var(--color-teal-bright))' }} />
          <path d="M55 90 H145" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4" />
          <text x="100" y="102" fill="var(--color-text-light)" fontSize="10" fontFamily="var(--font-heading)" fontStyle="italic" textAnchor="middle" letterSpacing="1">ODIN</text>
        </svg>
      );

    case 'prod-2': // Shaker de Mjölnir
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-steel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#222428" />
              <stop offset="50%" stopColor="#7a828a" />
              <stop offset="100%" stopColor="#141518" />
            </linearGradient>
          </defs>
          {/* Shaker body */}
          <path d="M65 40 L72 150 C73 158 80 164 88 164 H112 C120 164 127 158 128 150 L135 40 Z" fill="url(#grad-steel)" stroke="var(--color-steel-light)" strokeWidth="1.5" />
          {/* Lid */}
          <path d="M60 30 H140 V40 H60 Z" fill="#111215" stroke="var(--color-teal)" strokeWidth="1.5" />
          <rect x="90" y="14" width="20" height="16" rx="1" fill="#202227" stroke="var(--color-teal)" strokeWidth="1" />
          {/* Mjolnir Hammer engraving */}
          <g stroke="var(--color-teal-bright)" strokeWidth="2" strokeLinecap="round" opacity="0.9">
            {/* Hammer Head */}
            <path d="M85 85 H115 V97 H85 Z" fill="#16181d" />
            <path d="M85 85 L80 91 V97 H120 V91 L115 85" fill="#16181d" />
            {/* Handle */}
            <line x1="100" y1="97" x2="100" y2="120" strokeWidth="2.5" />
            {/* Base triangular wrap */}
            <path d="M92 120 H108 L100 126 Z" fill="#16181d" />
          </g>
          {/* Measured mark */}
          <line x1="125" y1="60" x2="130" y2="60" stroke="#4a5568" strokeWidth="1.5" />
          <line x1="123" y1="80" x2="130" y2="80" stroke="#4a5568" strokeWidth="1.5" />
          <line x1="125" y1="100" x2="130" y2="100" stroke="#4a5568" strokeWidth="1.5" />
          <line x1="123" y1="120" x2="130" y2="120" stroke="#4a5568" strokeWidth="1.5" />
        </svg>
      );

    case 'prod-3': // Camiseta "Clan Valhalla"
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* T-Shirt Shape */}
          <path d="M60 40 L76 24 L100 32 L124 24 L140 40 L128 60 L120 54 V168 C120 172 116 176 112 176 H88 C84 176 80 172 80 168 V54 L72 60 Z" fill="#111215" stroke="var(--color-teal)" strokeWidth="2" />
          {/* Collar cut */}
          <path d="M92 30 C95 35 105 35 108 30" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
          {/* Logo print */}
          <circle cx="100" cy="90" r="22" stroke="var(--color-wood)" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          {/* Axes */}
          <line x1="88" y1="78" x2="112" y2="102" stroke="var(--color-teal-bright)" strokeWidth="1.5" opacity="0.8" />
          <line x1="112" y1="78" x2="88" y2="102" stroke="var(--color-teal-bright)" strokeWidth="1.5" opacity="0.8" />
          <text x="100" y="130" fill="var(--color-text-light)" fontSize="9.5" fontFamily="var(--font-heading)" fontStyle="italic" textAnchor="middle" letterSpacing="1">VALHALLA</text>
        </svg>
      );

    case 'prod-4': // Cinturón "Asgard"
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-leather" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-wood-light)" />
              <stop offset="100%" stopColor="var(--color-wood)" />
            </linearGradient>
          </defs>
          {/* Outer ring (belt rolled up) */}
          <circle cx="100" cy="100" r="70" stroke="url(#grad-leather)" strokeWidth="18" fill="none" />
          {/* Inner ring */}
          <circle cx="100" cy="100" r="54" stroke="#48301a" strokeWidth="8" fill="none" />
          
          {/* Stitching details on belt */}
          <circle cx="100" cy="100" r="76" stroke="var(--color-teal)" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.4" />
          <circle cx="100" cy="100" r="64" stroke="var(--color-teal)" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.4" />
          
          {/* Belt Holes */}
          <g fill="#08090a">
            <circle cx="100" cy="34" r="2.5" />
            <circle cx="136" cy="46" r="2.5" />
            <circle cx="160" cy="76" r="2.5" />
          </g>

          {/* Heavy Steel Buckle/Lever */}
          <rect x="42" y="80" width="22" height="40" rx="1" fill="#27292e" stroke="var(--color-teal)" strokeWidth="1.5" />
          <rect x="49" y="88" width="8" height="24" rx="0" fill="#000" />
          {/* Rivets */}
          <circle cx="53" cy="74" r="2" fill="#8e959b" />
          <circle cx="53" cy="126" r="2" fill="#8e959b" />
        </svg>
      );

    case 'prod-5': // Sangre de Gigante (Creatina)
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="45" y="50" width="110" height="110" rx="6" fill="#111215" stroke="var(--color-teal)" strokeWidth="2.5" />
          {/* Cap */}
          <rect x="52" y="32" width="96" height="18" rx="2" fill="#08090a" stroke="var(--color-teal)" strokeWidth="1.5" />
          {/* Label */}
          <rect x="49" y="74" width="102" height="60" rx="1.5" fill="var(--color-teal-dim)" stroke="var(--color-teal)" strokeWidth="1" />
          {/* Giants symbol (Double Triangle / Valknut) */}
          <path d="M92 118 L100 100 L108 118 Z" stroke="var(--color-teal-bright)" strokeWidth="1.5" fill="none" />
          <path d="M100 118 L108 100 L116 118 Z" stroke="var(--color-teal-bright)" strokeWidth="1.5" fill="none" />
          <text x="100" y="93" fill="var(--color-text-light)" fontSize="9" fontFamily="var(--font-heading)" fontStyle="italic" textAnchor="middle" letterSpacing="0.5">JOTUNN</text>
          {/* Warning stripes */}
          <line x1="45" y1="144" x2="155" y2="144" stroke="var(--color-teal)" strokeWidth="2" strokeDasharray="5 3" />
        </svg>
      );

    case 'prod-6': // Correas "Fenrir"
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-strap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e2025" />
              <stop offset="100%" stopColor="#08090b" />
            </linearGradient>
          </defs>
          {/* Strap 1 */}
          <path d="M40 50 L150 160 C155 165 165 165 170 160 L180 150 C185 145 185 135 180 130 L70 20 Z" fill="url(#grad-strap)" stroke="var(--color-teal)" strokeWidth="1.5" />
          {/* Strap 2 (Crossed) */}
          <path d="M160 50 L50 160 C45 165 35 165 30 160 L20 150 C15 145 15 135 20 130 L130 20 Z" fill="url(#grad-strap)" stroke="var(--color-teal)" strokeWidth="1.5" opacity="0.9" />
          
          {/* Stitching lines */}
          <path d="M43 45 L153 155" stroke="var(--color-wood-light)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M157 45 L47 155" stroke="var(--color-wood-light)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          
          {/* Neoprene padding indicators */}
          <rect x="90" y="30" width="20" height="28" rx="1" fill="#08090a" stroke="var(--color-teal)" strokeWidth="1" transform="rotate(45 100 44)" />
          
          {/* Wolf logo glyph */}
          <path d="M96 90 L100 82 L104 90 L100 95 Z" fill="var(--color-teal-bright)" />
          <path d="M92 92 L95 86 L98 92 Z" fill="var(--color-teal-bright)" />
          <path d="M108 92 L105 86 L102 92 Z" fill="var(--color-teal-bright)" />
        </svg>
      );

    default:
      return (
        <div style={{ width: size, height: size, background: 'var(--color-bg-card)', border: '1px solid var(--color-teal-dim)', borderRadius: '50%' }}></div>
      );
  }
}
