import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function UserPanel({ currentUser, products, orders, setOrders, onLogout }) {
  const [activeTab, setActiveTab] = useState('progress'); // Default to Mi Evolución
  
  // Profile avatar state
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  useEffect(() => {
    setAvatar(currentUser?.avatar || '');
  }, [currentUser]);

  // Cafe cart & order states
  const [cafeCart, setCafeCart] = useState([]);
  const [isOrderingCafe, setIsOrderingCafe] = useState(false);
  const [cafeStatus, setCafeStatus] = useState('');

  // Measurements state
  const [measurements, setMeasurements] = useState([]);
  const [loadingMeas, setLoadingMeas] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  const fetchMyNotifications = async () => {
    try {
      const token = localStorage.getItem('valhalla_token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('valhalla_token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    fetchMyNotifications();
    if (activeTab === 'progress') fetchMyMeasurements();
  }, [activeTab]);

  const fetchMyMeasurements = async () => {
    setLoadingMeas(true);
    try {
      const token = localStorage.getItem('valhalla_token');
      const res = await fetch(`${API_BASE_URL}/api/measurements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMeasurements(await res.json());
    } catch (err) {
      console.error('Error fetching measurements:', err);
    } finally {
      setLoadingMeas(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setAvatar(base64);
        
        // Save to backend database
        try {
          const token = localStorage.getItem('valhalla_token');
          await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ avatar: base64 })
          });
        } catch (err) {
          console.error('Error saving avatar to backend:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleCafeOrderSubmit = async () => {
    if (cafeCart.length === 0) return;
    setIsOrderingCafe(true);
    setCafeStatus('');

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
          total: cafeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          order_type: 'cafe',
          phone: '',
          address: 'Barra'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCafeCart([]);
        setCafeStatus('✓ ¡Pedido enviado a la barra! Preparando...');
        setOrders(prev => [data, ...prev]);
        setTimeout(() => setCafeStatus(''), 5000);
      } else {
        setCafeStatus('❌ Hubo un error al enviar tu pedido');
      }
    } catch (err) {
      setCafeStatus('❌ No hay conexión con el servidor');
    } finally {
      setIsOrderingCafe(false);
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return isoString; }
  };

  // ── AUTO-CALCULATED METRICS ──
  const calcMetrics = (m) => {
    const r = {};
    const h = m.height ? parseFloat(m.height) : null;
    const w = m.weight ? parseFloat(m.weight) : null;
    const bf = m.body_fat !== null && m.body_fat !== '' ? parseFloat(m.body_fat) : null;
    const wt = m.waist ? parseFloat(m.waist) : null;
    const hp = m.hips ? parseFloat(m.hips) : null;

    // IMC / BMI
    if (w && h) {
      const hm = h / 100;
      const bmi = w / (hm * hm);
      r.bmi = bmi.toFixed(1);
      if (bmi < 18.5) r.bmiCat = { label: 'Bajo peso', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
      else if (bmi < 25) r.bmiCat = { label: 'Normal ✓', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
      else if (bmi < 30) r.bmiCat = { label: 'Sobrepeso', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
      else if (bmi < 35) r.bmiCat = { label: 'Obesidad I', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
      else r.bmiCat = { label: 'Obesidad II', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    }

    // Composición corporal
    if (w && bf !== null) {
      r.fatMass = (w * bf / 100).toFixed(1);
      r.leanMass = (w * (1 - bf / 100)).toFixed(1);
    }

    // Índice cintura-cadera (ICC)
    if (wt && hp) {
      const icc = wt / hp;
      r.icc = icc.toFixed(2);
      const male = m.gender === 'masculino';
      const lowT = male ? 0.90 : 0.80;
      const highT = male ? 1.00 : 0.85;
      if (icc < lowT) r.iccRisk = { label: 'Riesgo bajo', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
      else if (icc < highT) r.iccRisk = { label: 'Riesgo moderado', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
      else r.iccRisk = { label: 'Riesgo alto', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    }

    // Índice cintura-talla (ICT)
    if (wt && h) {
      const ict = wt / h;
      r.ict = ict.toFixed(2);
      if (ict < 0.40) r.ictRisk = { label: 'Muy delgado', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
      else if (ict < 0.50) r.ictRisk = { label: 'Saludable ✓', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
      else if (ict < 0.60) r.ictRisk = { label: 'Sobrepeso', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
      else r.ictRisk = { label: 'Obesidad', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    }

    // Presión arterial
    const sys = m.systolic ? parseInt(m.systolic) : null;
    const dia = m.diastolic ? parseInt(m.diastolic) : null;
    if (sys && dia) {
      r.bp = `${sys}/${dia}`;
      if (sys < 120 && dia < 80) r.bpCat = { label: 'Óptima', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
      else if (sys < 130 && dia < 85) r.bpCat = { label: 'Normal', color: '#86efac', bg: 'rgba(134,239,172,0.12)' };
      else if (sys < 140 || dia < 90) r.bpCat = { label: 'Normal-Alta', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
      else if (sys < 160 || dia < 100) r.bpCat = { label: 'HTA Grado 1', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' };
      else r.bpCat = { label: 'HTA Grado 2', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    }

    // Frecuencia cardíaca en reposo
    const hr = m.resting_hr ? parseInt(m.resting_hr) : null;
    if (hr) {
      r.hr = hr;
      if (hr < 50) r.hrCat = { label: 'Atleta élite', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
      else if (hr < 60) r.hrCat = { label: 'Muy buena', color: '#86efac', bg: 'rgba(134,239,172,0.12)' };
      else if (hr < 70) r.hrCat = { label: 'Buena', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
      else if (hr < 80) r.hrCat = { label: 'Normal', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' };
      else r.hrCat = { label: 'Por encima', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    }

    // Asimetría de brazos
    const bl = m.biceps_left ? parseFloat(m.biceps_left) : null;
    const br = m.biceps_right ? parseFloat(m.biceps_right) : null;
    if (bl && br) r.armAsym = Math.abs(bl - br).toFixed(1);

    // Calorías de mantenimiento estimadas (Harris-Benedict simplificado)
    if (w && h && m.age && m.gender) {
      const a = parseInt(m.age);
      let bmr;
      if (m.gender === 'masculino') bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
      else bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
      r.bmr = Math.round(bmr);
      r.tdeeModerate = Math.round(bmr * 1.55); // actividad moderada
    }

    return r;
  };

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const tabs = [
    { id: 'progress', label: '📊 Mi Evolución' },
    { id: 'notifications', label: '🔔 Alertas', count: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: 'cafe', label: '☕ Pedir a la Barra' },
    { id: 'orders', label: '📜 Mis Pedidos', count: orders.length },
  ];

  // Measurement field labels for the detail view
  const measFields = [
    { key: 'weight', label: 'Peso', unit: 'kg', icon: '⚖️', color: '#fbbf24' },
    { key: 'height', label: 'Talla', unit: 'cm', icon: '📏', color: '#818cf8' },
    { key: 'body_fat', label: '% Grasa', unit: '%', icon: '🔥', color: '#f87171' },
    { key: 'neck', label: 'Cuello', unit: 'cm', icon: '—', color: '#9ca3af' },
    { key: 'shoulders', label: 'Hombros', unit: 'cm', icon: '—', color: '#9ca3af' },
    { key: 'chest', label: 'Pecho', unit: 'cm', icon: '💪', color: '#10b981' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: '📐', color: '#14b8a6' },
    { key: 'hips', label: 'Caderas', unit: 'cm', icon: '—', color: '#8b5cf6' },
    { key: 'biceps_left', label: 'Bíceps Izq.', unit: 'cm', icon: '💪', color: '#10b981' },
    { key: 'biceps_right', label: 'Bíceps Der.', unit: 'cm', icon: '💪', color: '#10b981' },
    { key: 'thighs_left', label: 'Muslo Izq.', unit: 'cm', icon: '—', color: '#9ca3af' },
    { key: 'thighs_right', label: 'Muslo Der.', unit: 'cm', icon: '—', color: '#9ca3af' },
    { key: 'calves_left', label: 'Gemelo Izq.', unit: 'cm', icon: '—', color: '#9ca3af' },
    { key: 'calves_right', label: 'Gemelo Der.', unit: 'cm', icon: '—', color: '#9ca3af' },
  ];

  return (
    <section className="user-panel section-padding watermark-container" id="user-panel" style={{ paddingTop: '100px' }}>
      <div className="watermark-text">GUERRERO</div>
      
      <div className="container">
        
        {/* Profile Card / Header with Avatar Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              border: '3px solid var(--color-teal-bright)',
              background: avatar ? `url(${avatar}) no-repeat center center/cover` : 'linear-gradient(135deg, #14b8a6, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: '800', color: '#fff',
              boxShadow: '0 8px 24px rgba(20, 184, 166, 0.25)',
              overflow: 'hidden'
            }}>
              {!avatar && (currentUser?.username?.[0]?.toUpperCase() || 'G')}
            </div>
            <label style={{
              position: 'absolute', bottom: '0', right: '0',
              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
              border: 'none', width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              fontSize: '1.1rem', color: '#000', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              📷
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.8rem', fontStyle: 'italic', margin: 0 }}>
              {currentUser?.username.toUpperCase()}
            </h2>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              background: 'rgba(20, 184, 166, 0.15)', color: 'var(--color-teal-bright)',
              border: '1px solid rgba(20, 184, 166, 0.3)', padding: '4px 14px',
              borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              ⚔️ Guerrero de Valhalla
            </span>
            {onLogout && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={onLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#fca5a5',
                    padding: '6px 16px', borderRadius: 'var(--border-radius-sm)',
                    fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px'
                  }}>
                  Cerrar Sesión ⏻
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner de Membresía */}
        {(() => {
          if (!currentUser?.membership_end_date) return null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const end = new Date(currentUser.membership_end_date);
          end.setHours(0, 0, 0, 0);
          const diffTime = end.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let alertColor = 'var(--color-teal-bright)';
          let alertBg = 'rgba(20, 184, 166, 0.05)';
          let alertBorder = 'rgba(20, 184, 166, 0.2)';
          let textMsg = `⚔️ Membresía Activa. Tu mensualidad vence el ${currentUser.membership_end_date}.`;

          if (currentUser.membership_status === 'expired' || diffDays < 0) {
            alertColor = '#f87171';
            alertBg = 'rgba(239, 68, 68, 0.08)';
            alertBorder = 'rgba(239, 68, 68, 0.3)';
            textMsg = `🚨 Membresía Vencida el ${currentUser.membership_end_date}. Por favor acude a recepción a registrar tu pago.`;
          } else if (diffDays <= 3) {
            alertColor = '#fbbf24';
            alertBg = 'rgba(251, 191, 36, 0.08)';
            alertBorder = 'rgba(251, 191, 36, 0.3)';
            textMsg = `⚠️ Tu mensualidad vence en ${diffDays === 0 ? 'hoy' : diffDays + ' día(s)'} (${currentUser.membership_end_date}). Registra tu pago en recepción.`;
          }

          return (
            <div style={{
              background: alertBg, border: `1px solid ${alertBorder}`, color: alertColor,
              padding: '14px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600',
              textAlign: 'center', marginBottom: '24px', letterSpacing: '0.5px'
            }}>
              {textMsg}
            </div>
          );
        })()}

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0', justifyContent: 'center' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '12px 20px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? '700' : '400',
                color: activeTab === tab.id ? 'var(--color-teal-bright)' : 'rgba(255,255,255,0.45)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-teal-bright)' : '2px solid transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ background: activeTab === tab.id ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)', color: activeTab === tab.id ? '#14b8a6' : 'rgba(255,255,255,0.4)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', margin: 0 }}>
              🔔 Bitácora del Templo (Notificaciones)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, rgba(20,184,166,0.05), rgba(255,255,255,0.01))',
                  border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(20,184,166,0.2)'}`,
                  padding: '16px 20px', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: '700' }}>
                      {formatDate(n.date)}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        style={{
                          background: 'rgba(20,184,166,0.15)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.25)',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer'
                        }}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                  <p style={{ color: '#fff', fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.01)', border: '1px dotted rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  ⚔️ No hay avisos por el momento. ¡Sigue entrenando duro!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CAFE TAB ── */}
        {activeTab === 'cafe' && (() => {
          const cafeProducts = products.filter(p => p.category === 'cafe');
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {cafeProducts.map(product => (
                  <div key={product.id} className="product-card glass" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '3.5rem' }}>🥤</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.1rem', fontFamily: 'var(--font-subheading)' }}>{product.name}</h3>
                      <p style={{ margin: '0 0 16px 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', flexGrow: 1 }}>{product.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ color: 'var(--color-teal-bright)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.price.toFixed(2)}</span>
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setCafeCart(prev => {
                              const existing = prev.find(i => i.id === product.id);
                              if (existing) {
                                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
                              }
                              return [...prev, { ...product, quantity: 1 }];
                            });
                          }}
                          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                        >
                          Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {cafeProducts.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>No hay productos de cafetería disponibles en este momento.</p>
                  </div>
                )}
              </div>

              {/* Cafe Cart */}
              {cafeCart.length > 0 && (
                <div className="glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.3)', textAlign: 'left', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>Tu Pedido a la Barra ☕</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {cafeCart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--color-gold)', fontWeight: 'bold', marginRight: '8px' }}>{item.quantity}x</span>
                          <span style={{ color: '#fff', fontSize: '0.9rem' }}>{item.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--color-teal-bright)', fontSize: '0.9rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => setCafeCart(prev => prev.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Total:</span>
                      <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>${cafeCart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={handleCafeOrderSubmit}
                      disabled={isOrderingCafe}
                      style={{ minWidth: '150px' }}
                    >
                      {isOrderingCafe ? 'Enviando...' : 'Pedir a la Barra 🔥'}
                    </button>
                  </div>
                  {cafeStatus && (
                    <div style={{ marginTop: '12px', textAlign: 'center', color: cafeStatus.includes('❌') ? '#fca5a5' : '#6ee7b7', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {cafeStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(20, 156, 144, 0.15)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-teal-bright)', fontStyle: 'italic', marginBottom: '24px', letterSpacing: '1px' }}>
                🛡️ Historial de Órdenes
              </h3>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-dim)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>᚛ ᚜</span>
                  <p>Aún no has forjado pedidos.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                  {orders.map((ord) => (
                    <div key={ord.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--border-radius-sm)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontFamily: 'var(--font-body)' }}>{ord.id.substring(0, 10)}</span>
                          <h4 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-subheading)', margin: '4px 0 0', fontWeight: 'bold' }}>{formatDate(ord.date)}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', background: ord.order_type === 'cafe' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(20, 184, 166, 0.12)', color: ord.order_type === 'cafe' ? '#fbbf24' : '#14b8a6' }}>
                            {ord.order_type === 'cafe' ? '☕ Cafetería' : '🛍️ Tienda'}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '2px', textTransform: 'uppercase', background: ord.status === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: ord.status === 'delivered' ? '#86efac' : '#fca5a5', border: ord.status === 'delivered' ? '1px solid #22c55e' : '1px solid #ef4444' }}>
                            {ord.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '8px 0' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>Items:</span>
                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                          {ord.products.map((p, i) => <li key={i}>{p.quantity}x {p.name} (${p.price.toFixed(2)})</li>)}
                        </ul>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)' }}>📍 {ord.address || 'Barra'}</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 'bold', color: 'var(--color-teal-bright)', fontSize: '1.25rem' }}>Total: ${ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div>
            {loadingMeas ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>ᛟ</div>
                <p>Cargando registros...</p>
              </div>
            ) : measurements.length === 0 ? (
              <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(20,156,144,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-teal-bright)', marginBottom: '12px' }}>Sin medidas registradas</h3>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                  El administrador aún no ha registrado ninguna medición de tu progreso. Consulta con tu entrenador.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Latest snapshot cards */}
                {(() => {
                  const last = measurements[0];
                  const m = calcMetrics(last);
                  const metricCards = [
                    m.bmi && { label: 'IMC', value: m.bmi, sub: m.bmiCat?.label, color: m.bmiCat?.color, bg: m.bmiCat?.bg, icon: '⚖️' },
                    m.leanMass && { label: 'Masa Magra', value: `${m.leanMass} kg`, sub: 'músculo + hueso', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '💪' },
                    m.fatMass && { label: 'Masa Grasa', value: `${m.fatMass} kg`, sub: `${last.body_fat}% del total`, color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: '🔥' },
                    m.icc && { label: 'Índice C-C', value: m.icc, sub: m.iccRisk?.label, color: m.iccRisk?.color, bg: m.iccRisk?.bg, icon: '📐' },
                    m.bp && { label: 'Presión', value: m.bp, sub: m.bpCat?.label, color: m.bpCat?.color, bg: m.bpCat?.bg, icon: '❤️' },
                    m.hr && { label: 'FC Reposo', value: `${m.hr} bpm`, sub: m.hrCat?.label, color: m.hrCat?.color, bg: m.hrCat?.bg, icon: '💓' },
                  ].filter(Boolean);

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontStyle: 'italic' }}>
                          ⚡ Última Medición
                        </h3>
                        <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                          {new Date(last.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '8px' }}>
                        {metricCards.map((card, i) => (
                          <div key={i} className="glass" style={{ background: card.bg, padding: '18px', borderRadius: '14px', border: `1px solid ${card.color}25`, textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{card.icon}</div>
                            <div style={{ color: card.color, fontWeight: '800', fontSize: '1.4rem', lineHeight: 1 }}>{card.value}</div>
                            {card.sub && <div style={{ color: card.color, fontSize: '0.72rem', fontWeight: '600', marginTop: '6px', opacity: 0.8 }}>{card.sub}</div>}
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Detalle Corporal</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                          {measFields.map(field => last[field.key] ? (
                            <div key={field.key} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{field.icon}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>{field.label}</div>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: field.color }}>{last[field.key]} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{field.unit}</span></div>
                            </div>
                          ) : null)}
                        </div>
                      </div>

                      {last.notes && (
                        <div className="glass" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                          <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Notas del Entrenador: </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{last.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* History table */}
                <div>
                  <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '16px' }}>📋 Historial Completo</h3>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(20,156,144,0.1)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid rgba(20,156,144,0.2)' }}>
                            {['Fecha', 'Peso', 'Talla', '% Grasa', 'IMC', 'Magra', 'Cintura', 'Pecho', 'PA', 'FC'].map((h, i) => (
                              <th key={i} style={{ padding: '14px 16px', color: 'var(--color-gold)', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {measurements.map((m, idx) => {
                            const prev = measurements[idx + 1];
                            const calc = calcMetrics(m);
                            const delt = (field) => {
                              if (!prev || m[field] == null || prev[field] == null) return null;
                              const d = parseFloat((m[field] - prev[field]).toFixed(1));
                              if (d === 0) return null;
                              return <span style={{ fontSize: '0.62rem', color: d > 0 ? '#34d399' : '#f87171', marginLeft: '3px' }}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>;
                            };
                            const fmt = v => v != null ? v : '—';
                            return (
                              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                  <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.82rem' }}>{new Date(m.date).toLocaleDateString('es-MX')}</div>
                                  {idx === 0 && <span style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6', fontSize: '0.6rem', padding: '1px 6px', borderRadius: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>ÚLTIMO</span>}
                                </td>
                                <td style={{ padding: '14px 16px', color: '#fbbf24', fontWeight: '700' }}>{fmt(m.weight)}{delt('weight')}</td>
                                <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)' }}>{fmt(m.height)}</td>
                                <td style={{ padding: '14px 16px', color: '#f87171' }}>{m.body_fat != null ? `${m.body_fat}%` : '—'}{delt('body_fat')}</td>
                                <td style={{ padding: '14px 16px' }}>
                                  {calc.bmi ? (
                                    <span style={{ background: calc.bmiCat?.bg, color: calc.bmiCat?.color, padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                      {calc.bmi}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '14px 16px', color: '#10b981' }}>{calc.leanMass ? `${calc.leanMass}` : '—'}</td>
                                <td style={{ padding: '14px 16px', color: '#14b8a6' }}>{fmt(m.waist)}{delt('waist')}</td>
                                <td style={{ padding: '14px 16px', color: '#14b8a6' }}>{fmt(m.chest)}{delt('chest')}</td>
                                <td style={{ padding: '14px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                  {m.systolic && m.diastolic ? (
                                    <span style={{ color: calc.bpCat?.color }}>{m.systolic}/{m.diastolic}</span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                                  {m.resting_hr ? <span style={{ color: calc.hrCat?.color }}>{m.resting_hr}</span> : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
