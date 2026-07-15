import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Shop from './components/Shop';
import Coaching from './components/Coaching';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Admin from './components/Admin';
import UserPanel from './components/UserPanel';
import Cafe from './components/Cafe';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [particlesList, setParticlesList] = useState([]);

  // Full-Stack Dynamic States
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  // Login Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Fetch initial data from SQLite backend API
  const fetchData = async () => {
    try {
      const [resProd, resPlan, resFeat] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/plans`),
        fetch(`${API_BASE_URL}/api/features`)
      ]);

      if (resProd.ok) setProducts(await resProd.json());
      if (resPlan.ok) setPlans(await resPlan.json());
      if (resFeat.ok) setFeatures(await resFeat.json());
    } catch (err) {
      console.error('Error fetching data from Valhalla API:', err);
    }
  };

  // Fetch orders from SQLite backend
  const fetchOrders = async (token) => {
    const activeToken = token || localStorage.getItem('valhalla_token');
    if (!activeToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Validate active session token
  const checkAuth = async () => {
    const token = localStorage.getItem('valhalla_token');
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        return token;
      } else {
        localStorage.removeItem('valhalla_token');
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      localStorage.removeItem('valhalla_token');
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      const token = await checkAuth();
      await fetchData();
      if (token) {
        await fetchOrders(token);
      }
      setLoading(false);
    };
    init();

    // Generate embers background particles
    const list = Array.from({ length: 18 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 12
    }));
    setParticlesList(list);
  }, []);

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Credenciales inválidas');
        return;
      }

      localStorage.setItem('valhalla_token', data.token);
      setCurrentUser(data.user);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });

      // Load orders immediately for the newly logged-in user
      await fetchOrders(data.token);

      // Re-open cart on login if it has items
      if (cartItems.length > 0) {
        setIsCartOpen(true);
      }
    } catch (err) {
      setAuthError('No se pudo conectar con la Forja (Servidor caído)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('valhalla_token');
    setCurrentUser(null);
    setOrders([]);
    setActiveTab('home');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px', backgroundColor: 'var(--color-bg-dark)' }}>
        <div className="rune-glow" style={{ fontSize: '5rem', fontFamily: 'var(--font-heading)', animation: 'runeGlow 1.5s infinite ease-in-out' }}>ᛟ</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-teal-bright)', letterSpacing: '4px', fontSize: '1.25rem', fontStyle: 'italic' }}>
          DESPERTANDO A LA HORDA...
        </h2>
      </div>
    );
  }

  // If admin is logged in → render standalone dashboard (no landing)
  if (currentUser?.role === 'admin') {
    return (
      <Admin
        products={products}
        setProducts={setProducts}
        plans={plans}
        setPlans={setPlans}
        features={features}
        setFeatures={setFeatures}
        orders={orders}
        setOrders={setOrders}
        fetchOrders={fetchOrders}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // If normal user is logged in → render standalone dashboard (no landing)
  if (currentUser?.role === 'user') {
    return (
      <UserPanel
        currentUser={currentUser}
        products={products}
        orders={orders}
        setOrders={setOrders}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {/* Dynamic drifting Norse embers / ash particles background */}
      <div className="particles-container">
        {particlesList.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          ></div>
        ))}
      </div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onLoginClick={() => {
          setAuthError('');
          setShowLoginModal(true);
        }}
        onLogoutClick={handleLogout}
      />
      
      <main className="main-content">
        {activeTab === 'user-panel' && currentUser?.role === 'user' ? (
          <UserPanel
            currentUser={currentUser}
            products={products}
            orders={orders}
            setOrders={setOrders}
          />
        ) : activeTab === 'cafe' ? (
          <Cafe 
            products={products} 
            currentUser={currentUser} 
            onLoginPrompt={() => setShowLoginModal(true)} 
          />
        ) : (
          <>
            <Hero 
              onJoinHorde={() => {
                setActiveTab('coaching');
                document.getElementById('coaching')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreShop={() => {
                setActiveTab('shop');
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            
            <Features features={features} />
            
            <Shop products={products} onAddToCart={handleAddToCart} />
            
            <Coaching plans={plans} currentUser={currentUser} />
          </>
        )}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        currentUser={currentUser}
        onLoginPrompt={() => {
          setIsCartOpen(false);
          setAuthError('');
          setShowLoginModal(true);
        }}
      />

      <Footer setActiveTab={setActiveTab} />

      {/* Login Modal — solo acceso, sin registro público */}
      {showLoginModal && (
        <div className="modal-backdrop" id="login-portal-modal">
          <div className="modal-content glass" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                Acceso al Valhalla
              </h3>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <form className="booking-form" onSubmit={handleLoginSubmit}>
              {authError && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.82rem', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                  {authError}
                </div>
              )}
              
              <div className="form-group">
                <label>Nombre de Guerrero</label>
                <input
                  type="text"
                  required
                  id="auth-username-input"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Ej: ragnar"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label>Contraseña Sagrada</label>
                <input
                  type="password"
                  required
                  id="auth-password-input"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Ingresa tu clave..."
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <a 
                  href={`https://wa.me/573228672583?text=${encodeURIComponent('Hola, olvidé la contraseña de mi cuenta ' + (loginForm.username || '') + '. ¿Me pueden ayudar a restablecerla?')}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--color-teal-bright)', textDecoration: 'underline' }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" className="btn btn-primary" id="btn-auth-submit" style={{ width: '100%', marginTop: '12px' }}>
                <span>Iniciar Campaña ⚔️</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: '8px' }}>
                <span>El acceso es por invitación del Administrador.</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
