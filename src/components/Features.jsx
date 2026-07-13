import React from 'react';

export default function Features({ features = [] }) {
  return (
    <section className="features section-padding watermark-container" id="features">
      {/* Background Runic Watermark: ᛏᛖᛗᛈᛚᛖ (Temple) */}
      <div className="watermark-text">ᛏᛖᛗᛈᛚᛖ</div>

      <div className="container">
        <div className="section-header text-center">
          <span className="rune-glow">ᛋ ᚨ ᛚ ᚨ ᛋ</span>
          <h2 className="section-title">El Templo del Acero</h2>
          <p className="section-subtitle">
            Áreas de entrenamiento de alto impacto acondicionadas bajo una estética industrial oscura y ruda, ideales para enfocar tu mentalidad guerrera.
          </p>
        </div>

        <div className="features-grid grid-2">
          {features.map((feat) => (
            <div key={feat.id} className="feature-card glass">
              <div className="feature-icon-wrapper">
                <span className="feature-icon" style={{ filter: 'grayscale(100%)' }}>{feat.icon}</span>
              </div>
              <div className="feature-info">
                <span className="feature-area">{feat.area}</span>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-description">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational quote banner */}
        <div className="quote-banner glass text-center">
          <span className="quote-rune">ᛗ</span>
          <blockquote>
            "No hay lugar para la duda. El hierro nunca miente. Enfrenta la barra con coraje y forja tu propio Valhalla en la tierra."
          </blockquote>
          <cite>— Código de Fuerza de Valhalla</cite>
        </div>
      </div>
    </section>
  );
}
