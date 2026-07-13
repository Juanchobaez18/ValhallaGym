import React, { useState } from 'react';
import Logo from './Logo';

export default function Navbar({ activeTab, setActiveTab, cartCount, onCartOpen, currentUser, onLoginClick, onLogoutClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  let navItems = [];
  
  if (currentUser && currentUser.role === 'admin') {
    navItems = [{ id: 'admin', label: 'Admin' }];
  } else if (currentUser && currentUser.role === 'user') {
    // Simplified navbar for logged in users
    navItems = [
      { id: 'home', label: 'Inicio' },
      { id: 'user-panel', label: 'Mi Panel' }
    ];
  } else {
    // Full landing navigation for guests
    navItems = [
      { id: 'home', label: 'Inicio' },
      { id: 'features', label: 'El Gimnasio' },
      { id: 'shop', label: 'La Armería (Tienda)' },
      { id: 'coaching', label: 'Oráculo (Asesorías)' }
    ];
  }

  return (
    <nav className="navbar glass">
      <div className="navbar-container container">
        <div className="navbar-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <Logo size={48} showText={false} />
          <span className="navbar-title">
            VALHALLA <span className="accent-text font-serif">GYM</span>
          </span>
        </div>

        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`navbar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'admin') {
                    setTimeout(() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 50);
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button className="cart-toggle-btn" onClick={onCartOpen} aria-label="Abrir Carrito">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          
          {currentUser ? (
            <button 
              className="btn btn-secondary nav-cta"
              onClick={onLogoutClick}
              id="btn-nav-logout"
            >
              <span>👤 {currentUser.username.toUpperCase()} (SALIR)</span>
            </button>
          ) : (
            <button 
              className="btn btn-primary nav-cta"
              onClick={onLoginClick}
              id="btn-nav-login"
            >
              <span>ENTRAR</span>
            </button>
          )}

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', marginLeft: '12px' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ position: 'absolute', top: 'var(--header-height)', left: 0, width: '100%', background: 'var(--color-bg-dark)', padding: '20px', borderBottom: '1px solid var(--color-border)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
                if (item.id !== 'admin') {
                  setTimeout(() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }
              }}
              style={{ background: 'none', border: 'none', color: activeTab === item.id ? 'var(--color-teal)' : 'var(--color-text-light)', fontSize: '1.2rem', textAlign: 'left', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              {item.label}
            </button>
          ))}
          {currentUser ? (
            <button 
              onClick={() => { onLogoutClick(); setIsMobileMenuOpen(false); }}
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '1rem' }}
            >
              Cerrar Sesión ({currentUser.username})
            </button>
          ) : (
            <button 
              onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
              style={{ background: 'var(--color-teal)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '1rem', fontWeight: 'bold' }}
            >
              Entrar al Valhalla
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
