import React, { useState } from 'react';
import ProductImage from './ProductImage';

export default function Shop({ products = [], onAddToCart }) {
  const [filter, setFilter] = useState('all');

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <section className="shop section-padding watermark-container" id="shop">
      {/* Background Watermark */}
      <div className="watermark-text">ARMORY</div>

      <div className="container">
        <div className="section-header text-center">
          <span className="rune-glow">ᛏ ᛚ ᛟ ᚾ ᛞ ᚨ</span>
          <h2 className="section-title">La Armería de Valhalla</h2>
          <p className="section-subtitle">
            Equípate con suplementos y accesorios legendarios. Cada producto está consagrado para desatar tu máximo rendimiento.
          </p>
        </div>

        {/* Categories Tab */}
        <div className="shop-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Ver Todo
          </button>
          <button 
            className={`filter-btn ${filter === 'supplements' ? 'active' : ''}`}
            onClick={() => setFilter('supplements')}
          >
            Pócimas (Suplementos)
          </button>
          <button 
            className={`filter-btn ${filter === 'gear' ? 'active' : ''}`}
            onClick={() => setFilter('gear')}
          >
            Equipo y Accesorios
          </button>
          <button 
            className={`filter-btn ${filter === 'apparel' ? 'active' : ''}`}
            onClick={() => setFilter('apparel')}
          >
            Ropa (Armadura)
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid grid-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card glass">
              {/* Premium Corner Badge */}
              <div className="product-badge">
                <span>{product.category === 'supplements' ? 'ELIXIR NÓRDICO' : 'ACERO REFORZADO'}</span>
              </div>

              <div className="product-image-container" style={{ position: 'relative' }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(20,184,166,0.2)' }} />
                ) : (
                  <ProductImage id={product.id} size={160} />
                )}
              </div>
              
              <div className="product-info">
                <div className="product-rating">
                  <span className="stars">★ ★ ★ ★ ★</span>
                  <span className="rating-count">({product.reviews})</span>
                </div>
                
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <ul className="product-features">
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx}>
                      <span className="rune-bullet">ᛟ</span> {feature}
                    </li>
                  ))}
                </ul>

                <div className="product-footer">
                  <div className="product-price">
                    <span className="price-currency">$</span>
                    <span className="price-value">{product.price}</span>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-add-cart"
                    onClick={() => onAddToCart(product)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>Llevar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
