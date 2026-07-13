import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Hero({ onJoinHorde, onExploreShop }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Calculate values between -15 and 15 degrees for 3D card tilt
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * -20;
    setMousePos({ x, y });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header className="hero section-padding watermark-container" id="home">
      {/* Huge Runic Watermark text: ᚹᚨᚾᚻᚨᛚᛚᚨ (Valhalla) */}
      <div className="watermark-text">ᚹᚨᚾᚻᚨᛚᛚᚨ</div>

      <div className="hero-container container grid-2">
        <div className="hero-content">
          <div style={{ marginBottom: '20px' }}>
            <div className="brush-badge">
              <span>ESTILO VIKINGO • MENTE GUERRERA</span>
            </div>
          </div>
          
          <h1 className="hero-title">
            FORJA TU <span className="accent-text">LEYENDA</span>
            <br />
            ENTRENA COMO UN <span className="wood-text">DIOS</span>
          </h1>
          
          <p className="hero-description">
            En Valhalla Gym no esculpimos cuerpos comunes. Forjamos guerreros del acero. Fusionamos la preparación física moderna más exigente con la mística y disciplina implacable de los clanes nórdicos. Tu saga comienza hoy.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onJoinHorde}>
              <span>OBTENER ASESORÍA</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn btn-secondary" onClick={onExploreShop}>
              <span>VER LA ARMERÍA</span>
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">+500</span>
              <span className="stat-label">Guerreros</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Personalizado</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Soporte</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div 
            className="shield-3d-wrapper"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Rotating Runic Ring Ornament in the background of the shield */}
            <svg className="shield-ring-backdrop rotating-ring" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.25, filter: 'drop-shadow(0 0 10px var(--color-teal-glow))' }}>
              <circle cx="100" cy="100" r="95" stroke="var(--color-teal-bright)" strokeWidth="0.8" strokeDasharray="3 5" />
              <circle cx="100" cy="100" r="90" stroke="var(--color-teal)" strokeWidth="0.5" />
              <g fill="var(--color-teal-bright)" fontSize="7" fontFamily="var(--font-heading)" textAnchor="middle">
                <text x="100" y="16" transform="rotate(0 100 100)">ᚠ</text>
                <text x="100" y="16" transform="rotate(30 100 100)">ᚢ</text>
                <text x="100" y="16" transform="rotate(60 100 100)">ᚦ</text>
                <text x="100" y="16" transform="rotate(90 100 100)">ᚨ</text>
                <text x="100" y="16" transform="rotate(120 100 100)">ᚱ</text>
                <text x="100" y="16" transform="rotate(150 100 100)">ᚲ</text>
                <text x="100" y="16" transform="rotate(180 100 100)">ᚷ</text>
                <text x="100" y="16" transform="rotate(210 100 100)">ᚹ</text>
                <text x="100" y="16" transform="rotate(240 100 100)">ᚻ</text>
                <text x="100" y="16" transform="rotate(270 100 100)">ᚾ</text>
                <text x="100" y="16" transform="rotate(300 100 100)">ᛁ</text>
                <text x="100" y="16" transform="rotate(330 100 100)">ᛃ</text>
              </g>
            </svg>

            {/* Logo in the center of the giant shield */}
            <div className="giant-shield">
              <Logo size={290} showText={false} />
            </div>
            
            {/* Floating runes decorations */}
            <div className="floating-rune f-rune-1">ᚠ</div>
            <div className="floating-rune f-rune-2">ᚢ</div>
            <div className="floating-rune f-rune-3">ᚦ</div>
            <div className="floating-rune f-rune-4">ᚨ</div>
          </div>
        </div>
      </div>
      
      {/* Runic divider at bottom */}
      <div className="runic-divider">
        <div className="divider-line"></div>
        <div className="divider-rune">ᛟ</div>
        <div className="divider-line"></div>
      </div>
    </header>
  );
}
