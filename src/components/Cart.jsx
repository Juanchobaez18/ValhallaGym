import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import ProductImage from './ProductImage';

export default function Cart({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, currentUser, onLoginPrompt }) {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Auto-populate user name if user is logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      setUserName(currentUser.username);
    }
  }, [isOpen, currentUser]);

  const handleWhatsAppCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // 1. If logged in, save the order log to the SQLite database
    const token = localStorage.getItem('valhalla_token');
    if (token && currentUser) {
      try {
        await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            products: cartItems.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            total: subtotal,
            phone: userPhone,
            address: userAddress
          })
        });
      } catch (err) {
        console.error('Error logging order to SQL backend:', err);
      }
    }

    // 2. Open WhatsApp as before
    const phoneNumber = '573228672583';
    let message = '⚔️ *NUEVO PEDIDO - VALHALLA GYM* ⚔️\n\n';
    message += `*Cliente:* ${userName || 'No especificado'}\n`;
    message += `*Teléfono:* ${userPhone || 'No especificado'}\n`;
    message += `*Dirección:* ${userAddress || 'No especificada'}\n\n`;
    message += '*PRODUCTOS SELECCIONADOS:*\n';
    
    cartItems.forEach((item) => {
      message += `• ${item.quantity}x _${item.name}_ - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*TOTAL A PAGAR:* $${subtotal.toFixed(2)}\n\n`;
    message += '¡Por favor, confírmenme los datos para coordinar el pago y envío! 🛡️';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`cart-backdrop ${isOpen ? 'active' : ''}`} style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="cart-panel glass">
        <div className="cart-header">
          <h2>Tu Armería ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-rune">᚛ ᚜</span>
            <p>Tu inventario de guerra está vacío.</p>
            <button className="btn btn-primary" onClick={onClose}>
              Explorar Tienda
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <ProductImage id={item.id} size={64} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">${item.price.toFixed(2)}</span>
                    
                    <div className="cart-item-actions">
                      <div className="quantity-selector">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      
                      <button className="btn-remove" onClick={() => onRemoveItem(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <span>Subtotal:</span>
                <span className="cart-total-price">${subtotal.toFixed(2)}</span>
              </div>

              {!currentUser ? (
                <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.4' }}>
                    Debes iniciar sesión en el Valhalla para completar tu pedido y registrar tus compras.
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={onLoginPrompt}
                    style={{ width: '100%' }}
                  >
                    <span>Iniciar Sesión ⚔️</span>
                  </button>
                </div>
              ) : (
                <form className="cart-checkout-form" onSubmit={handleWhatsAppCheckout}>
                  <h3>Datos de Entrega</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Tu Nombre Guerrero"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      id="cart-shipping-name"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      placeholder="Tu WhatsApp (ej: +54...)"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      id="cart-shipping-phone"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Dirección de la Aldea (Envío)"
                      required
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      id="cart-shipping-address"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-checkout" id="btn-cart-checkout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.208-3.52c1.649.979 3.26 1.489 4.887 1.491 5.485.004 9.947-4.461 9.95-9.95.001-2.659-1.03-5.159-2.905-7.037-1.875-1.877-4.373-2.908-7.032-2.909-5.49 0-9.95 4.46-9.953 9.951-.001 1.83.5 3.593 1.45 5.176l-.999 3.649 3.738-.981zm11.387-5.464c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.299-.775.979-.95 1.178-.175.199-.35.224-.651.075-1.204-.602-2.148-1.055-3.002-2.528-.225-.39.225-.36.642-1.196.075-.15.038-.282-.019-.382-.056-.1-.475-1.146-.651-1.569-.171-.413-.344-.356-.475-.362-.122-.006-.262-.007-.402-.007-.14 0-.368.052-.56.262-.193.21-1.78 1.742-1.78 4.246 0 2.504 1.821 4.93 2.071 5.263.25.333 3.585 5.474 8.687 7.671 1.214.523 2.162.836 2.9.1.738-.1.738-.344.898-.564.16-.22.16-.364.08-.464-.08-.1-.301-.15-.601-.3z" />
                    </svg>
                    <span>Pedir por WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
