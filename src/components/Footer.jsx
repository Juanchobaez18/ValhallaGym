import React from 'react';
import Logo from './Logo';

export default function Footer({ setActiveTab }) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tabId) => {
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer glass">
      <div className="container footer-container">
        <div className="footer-brand">
          <Logo size={80} showText={true} />
          <p className="brand-description">
            Forjando guerreros y guerreras bajo el estándar del acero. Tu entrenamiento no es una rutina, es tu saga.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Navegación</h4>
            <ul>
              <li><button onClick={() => handleLinkClick('home')}>Inicio</button></li>
              <li><button onClick={() => handleLinkClick('features')}>El Gimnasio</button></li>
              <li><button onClick={() => handleLinkClick('shop')}>La Armería</button></li>
              <li><button onClick={() => handleLinkClick('coaching')}>Asesorías</button></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Horarios de Batalla</h4>
            <ul>
              <li><span>Lunes a Viernes:</span> 05:00 - 11:00 y 15:00 - 21:00</li>
              <li><span>Sábados y Festivos:</span> 07:00 - 12:00</li>
              <li><span>Domingos:</span> Cerrado (Descanso en el Asgard)</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>El Gran Salón</h4>
            <p>Dirección: Calle de las Hachas 106, Ciudad del Metal</p>
            <p>Teléfono: +57 322 867 2583</p>
            <p>Email: contacto@valhallagym.com</p>
            <div className="social-runes">
              <span>𝕏</span>
              <span>📷</span>
              <span>▶</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom text-center">
        <p>&copy; {currentYear} Valhalla Gym. Todos los derechos reservados. Diseñado para Guerreros del Acero.</p>
        <span className="runic-seal">ᛉ ᛏ ᚠ ᚻ ᛚ</span>
      </div>
    </footer>
  );
}
