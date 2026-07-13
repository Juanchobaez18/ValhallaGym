import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function Cafe({ products, currentUser, onLoginPrompt }) {
  const [cafeCart, setCafeCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products for cafe category
  const cafeProducts = products.filter(p => p.category === 'cafe');

  const addToCart = (product) => {
    setCafeCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCafeCart(prev => prev.filter(i => i.id !== id));
  };

  const calculateTotal = () => {
    return cafeCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrderSubmit = async () => {
    if (!currentUser) {
      onLoginPrompt();
      return;
    }
    if (cafeCart.length === 0) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('valhalla_token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          products: cafeCart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: calculateTotal(),
          order_type: 'cafe',
          phone: '', // Not needed for live orders
          address: 'Barra' // Or could be a table number
        })
      });

      if (res.ok) {
        setCafeCart([]);
        setOrderStatus('✓ ¡Pedido enviado a la barra! Preparando...');
        setTimeout(() => setOrderStatus(''), 5000);
      } else {
        setOrderStatus('❌ Hubo un error al enviar tu pedido');
        setTimeout(() => setOrderStatus(''), 3000);
      }
    } catch (err) {
      console.error('Error placing cafe order:', err);
      setOrderStatus('❌ No hay conexión con la barra');
      setTimeout(() => setOrderStatus(''), 3000);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', paddingBottom: '60px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="section-title">Cafetería <span>Valhalla</span></h1>
          <p className="section-subtitle">Recarga tus energías sin detener tu entrenamiento. Pide a la barra y recógelo al terminar tu set.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          {/* Main Layout: Products on left (or top), Cart on right (or bottom) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {cafeProducts.map(product => (
              <div key={product.id} className="product-card glass" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="product-image-container" style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
                  ) : (
                    <div style={{ fontSize: '4rem' }}>🥤</div> // Fallback cafe icon
                  )}
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2rem' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 15px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', flexGrow: 1 }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#14b8a6', fontWeight: 'bold', fontSize: '1.3rem' }}>${product.price}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => addToCart(product)}
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cafeProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>La barra está cerrada temporalmente. No hay productos disponibles.</p>
              </div>
            )}
          </div>

          {/* Mini Cart Bottom Bar or Side Panel */}
          {cafeCart.length > 0 && (
            <div style={{ 
              position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
              background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '16px', 
              padding: '20px', width: '90%', maxWidth: '600px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Tu Pedido a la Barra</h3>
                <span style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {cafeCart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              
              <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '15px' }}>
                {cafeCart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{item.quantity}x</span>
                      <span style={{ color: '#fff' }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ color: '#14b8a6' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Total a pagar</span>
                  <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>${calculateTotal().toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleOrderSubmit}
                  disabled={isSubmitting}
                  style={{ minWidth: '180px' }}
                >
                  {isSubmitting ? 'Enviando...' : '🔥 Pedir a Barra'}
                </button>
              </div>

              {orderStatus && (
                <div style={{ marginTop: '15px', textAlign: 'center', color: orderStatus.includes('❌') ? '#fca5a5' : '#6ee7b7', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {orderStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
