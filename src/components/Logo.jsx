import React from 'react';

export default function Logo({ className = '', size = 120, showText = true }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Circular cropped image of the actual wood-shield gym logo */}
      <img
        src="/logo.jpg"
        alt="Valhalla Gym Logo"
        width={size}
        height={size}
        style={{
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--color-teal)',
          boxShadow: '0 0 15px var(--color-teal-glow)',
          filter: 'drop-shadow(0 0 5px var(--color-teal-dim))',
          transition: 'var(--transition-smooth)'
        }}
      />
      {showText && (
        <div style={{ textAlign: 'center', textTransform: 'uppercase', marginTop: '2px', transform: 'skewX(-6deg)' }}>
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--color-teal-bright)', letterSpacing: '1.5px', animation: 'runeGlow 3.5s infinite ease-in-out', fontWeight: 'bold' }}>
            VALHALLA
          </h2>
          <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-heading)', color: 'var(--color-steel-light)', letterSpacing: '3px', margin: '0', fontWeight: 'bold' }}>
            GYM
          </h3>
        </div>
      )}
    </div>
  );
}
