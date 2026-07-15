import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Admin({ products, setProducts, plans, setPlans, features, setFeatures, orders = [], setOrders, fetchOrders, currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'user', phone: '', surgeries: '', medical_conditions: '', emergency_contact: '', birth_date: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Payments state
  const [payments, setPayments] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ user_id: '', plan_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Measurements / Progress state
  const [measurements, setMeasurements] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [measError, setMeasError] = useState('');
  const [measSuccess, setMeasSuccess] = useState('');
  const emptyMeas = {
    date: '', gender: '', age: '',
    weight: '', height: '', body_fat: '',
    neck: '', shoulders: '', chest: '', waist: '', hips: '',
    biceps_left: '', biceps_right: '',
    thighs_left: '', thighs_right: '',
    calves_left: '', calves_right: '',
    systolic: '', diastolic: '', resting_hr: '',
    goal: '', energy_level: '', sleep_hours: '',
    daily_calories: '', daily_protein: '',
    notes: ''
  };
  const [measForm, setMeasForm] = useState(emptyMeas);

  // Forms & Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editId, setEditId] = useState(null);
  const [serverError, setServerError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetType, setDeleteTargetType] = useState('');

  // Product form states
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'supplements', description: '', features: '', image: '' });
  const [planForm, setPlanForm] = useState({ name: '', description: '', price: '', icon: 'ᚢ', goals: '', bestFor: 'strength' });
  const [featureForm, setFeatureForm] = useState({ title: '', area: '', icon: '🛡️', desc: '' });

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


  const getHeaders = () => {
    const token = localStorage.getItem('valhalla_token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return isoString; }
  };

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: getHeaders() });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error('Error fetching users:', err); }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/payments`, { headers: getHeaders() });
      if (res.ok) setPayments(await res.json());
    } catch (err) { console.error('Error fetching payments:', err); }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setPaymentError(''); setPaymentSuccess('');
    
    const selectedUser = users.find(u => u.id === paymentForm.user_id);
    const selectedPlan = plans.find(p => p.id === paymentForm.plan_id);

    if (!selectedUser) {
      setPaymentError('Por favor selecciona un guerrero válido');
      return;
    }

    const payload = {
      ...paymentForm,
      username: selectedUser.username,
      plan_name: selectedPlan ? selectedPlan.name : 'Membresía Personalizada'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.error || 'Error al registrar el pago');
        return;
      }

      setPaymentSuccess('✓ ¡Pago registrado correctamente! Membresía del guerrero actualizada.');
      setPayments(prev => [data, ...prev]);
      
      setUsers(prev => prev.map(u => {
        if (u.id === paymentForm.user_id) {
          return {
            ...u,
            membership_plan_id: paymentForm.plan_id,
            membership_start_date: paymentForm.payment_date,
            membership_end_date: data.membership_end_date,
            membership_status: 'active'
          };
        }
        return u;
      }));

      setPaymentForm({
        user_id: '',
        plan_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      setTimeout(() => setPaymentSuccess(''), 4000);
    } catch (err) {
      setPaymentError('No se pudo conectar con el servidor');
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro de pago? Esto no revertirá las fechas del usuario de forma automática.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/payments/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        setPayments(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMeasurements();
    fetchPayments();
  }, []);

  // Poll orders when on Cafe section
  useEffect(() => {
    let interval;
    if (activeSection === 'cafe_orders' && fetchOrders) {
      interval = setInterval(() => {
        fetchOrders();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSection, fetchOrders]);

  // Fetch measurements for a specific user
  const fetchMeasurements = async (uid) => {
    if (!uid) { setMeasurements([]); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/measurements?user_id=${uid}`, { headers: getHeaders() });
      if (res.ok) setMeasurements(await res.json());
    } catch (err) { console.error('Error fetching measurements:', err); }
  };

  useEffect(() => {
    if (activeSection === 'progress' && selectedUserId) fetchMeasurements(selectedUserId);
    if (activeSection === 'progress' && !selectedUserId) setMeasurements([]);
  }, [activeSection, selectedUserId]);

  // Submit new measurement
  const handleMeasSubmit = async (e) => {
    e.preventDefault();
    setMeasError(''); setMeasSuccess('');
    const selUser = users.find(u => u.id === selectedUserId);
    if (!selUser) { setMeasError('Selecciona un guerrero primero'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/measurements`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ ...measForm, user_id: selUser.id, username: selUser.username })
      });
      const data = await res.json();
      if (!res.ok) { setMeasError(data.error || 'Error al guardar medidas'); return; }
      
      setMeasurements(prev => [data, ...prev]);
      setMeasForm(emptyMeas);
      setMeasSuccess('✓ Medidas registradas exitosamente');
      
      // WhatsApp Integration
      if (selUser.phone) {
        let cleanPhone = selUser.phone.replace(/\D/g, '');
        if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
          cleanPhone = '57' + cleanPhone;
        }
        if (cleanPhone) {
          const msg = `⚔️ *VALHALLA GYM - REPORTE DE LA FORJA* ⚔️\n\n` +
            `¡Saludos guerrero *${selUser.username.toUpperCase()}*!\n` +
            `Hemos actualizado tu progreso.\n\n` +
            (data.weight ? `⚖️ *Peso:* ${data.weight} kg\n` : '') +
            (data.body_fat ? `🔥 *Grasa Corporal:* ${data.body_fat}%\n` : '') +
            (data.muscle_mass ? `💪 *Masa Muscular:* ${data.muscle_mass} kg\n` : '') +
            (data.chest ? `🫁 *Pecho:* ${data.chest} cm\n` : '') +
            (data.waist ? `📏 *Cintura:* ${data.waist} cm\n` : '') +
            (data.arms ? `🦾 *Brazos:* ${data.arms} cm\n` : '') +
            (data.legs ? `🦵 *Piernas:* ${data.legs} cm\n` : '') +
            (data.notes ? `\n📝 *Notas del Entrenador:*\n_${data.notes}_\n` : '') +
            `\nEntra a tu *Panel de Guerrero* para ver tu Ficha Médica, el cálculo de tu Masa Magra, IMC, y tu progreso histórico detallado.\n\n` +
            `¡El Valhalla te espera!`;
          
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
          window.open(waUrl, '_blank');
        }
      }

      setTimeout(() => setMeasSuccess(''), 3000);
    } catch (err) { setMeasError('No se pudo conectar con el servidor'); }
  };

  // Delete a measurement record
  const handleDeleteMeas = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/measurements/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error('Error deleting measurement:', err); }
  };

  // Save user (Create or Edit)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserError(''); setUserSuccess('');
    
    const url = editUserId ? `${API_BASE_URL}/api/admin/users/${editUserId}` : `${API_BASE_URL}/api/admin/users`;
    const method = editUserId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: getHeaders(), body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || 'Error al guardar usuario'); return; }
      
      if (editUserId) {
        setUsers(prev => prev.map(u => u.id === editUserId ? data : u));
        setUserSuccess(`✓ Usuario "${data.username}" actualizado correctamente`);
      } else {
        setUsers(prev => [...prev, data]);
        setUserSuccess(`✓ Usuario "${data.username}" creado correctamente`);
      }
      
      setUserForm({ username: '', password: '', role: 'user', phone: '', surgeries: '', medical_conditions: '', emergency_contact: '', birth_date: '' });
      setEditUserId(null);
      setTimeout(() => setUserSuccess(''), 3000);
    } catch (err) { setUserError('No se pudo conectar con el servidor'); }
  };

  const handleEditUserClick = (u) => {
    setEditUserId(u.id);
    setUserForm({
      username: u.username,
      password: '', // blank password unless changing
      role: u.role,
      phone: u.phone || '',
      surgeries: u.surgeries || '',
      medical_conditions: u.medical_conditions || '',
      emergency_contact: u.emergency_contact || '',
      birth_date: u.birth_date || ''
    });
    setUserError('');
    setUserSuccess('');
    // scroll to form
    document.getElementById('user-form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) { console.error('Error deleting user:', err); }
  };

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`¿Estás seguro de que quieres restablecer la contraseña de ${username} a la clave por defecto "valhalla2026"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setServerError('La imagen es demasiado grande (máximo 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Promo WhatsApp Handler
  const sendOrderPromo = (ord) => {
    if (!ord.phone) return;
    let cleanPhone = ord.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
      cleanPhone = '57' + cleanPhone;
    }
    if (!cleanPhone) return;
    
    const msg = `⚔️ *VALHALLA GYM* ⚔️\n\n¡Saludos guerrero *${ord.username.toUpperCase()}*!\n\n` +
      `Vemos que adquiriste excelentes productos en nuestra armería. Tenemos promociones exclusivas en suplementos y ropa para nuestros clientes élite este mes.\n\n` +
      `Pregúntanos por las novedades y descuentos especiales para ti.\n\n¡Que la fuerza te acompañe!`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // CRUD helpers
  const handleOpenAdd = (section) => {
    setModalMode('add'); setEditId(null); setServerError('');
    if (section === 'products') setProductForm({ name: '', price: '', category: 'supplements', description: '', features: '', image: '' });
    else if (section === 'plans') setPlanForm({ name: '', description: '', price: '', icon: 'ᚢ', goals: '', bestFor: 'strength' });
    else setFeatureForm({ title: '', area: '', icon: '🛡️', desc: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (item, section) => {
    setModalMode('edit'); setEditId(item.id); setServerError('');
    if (section === 'products') setProductForm({ name: item.name, price: item.price.toString(), category: item.category, description: item.description, features: item.features.join(', '), image: item.image || '' });
    else if (section === 'plans') setPlanForm({ name: item.name, description: item.description, price: item.price.toString(), icon: item.icon, goals: item.goals.join(', '), bestFor: item.bestFor || 'strength' });
    else setFeatureForm({ title: item.title, area: item.area, icon: item.icon, desc: item.desc });
    setShowModal(true);
  };

  const handleDeleteTrigger = (id, type) => {
    setDeleteTargetId(id); setDeleteTargetType(type); setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setServerError('');
    const endpointMap = { products: 'products', plans: 'plans', features: 'features', orders: 'orders' };
    const endpoint = `${API_BASE_URL}/api/${endpointMap[deleteTargetType]}/${deleteTargetId}`;
    try {
      const res = await fetch(endpoint, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) { const e = await res.json(); setServerError(e.error || 'Error al eliminar'); setShowDeleteConfirm(false); return; }
      if (deleteTargetType === 'products') setProducts(prev => prev.filter(p => p.id !== deleteTargetId));
      else if (deleteTargetType === 'plans') setPlans(prev => prev.filter(p => p.id !== deleteTargetId));
      else if (deleteTargetType === 'features') setFeatures(prev => prev.filter(f => f.id !== deleteTargetId));
      else setOrders(prev => prev.filter(o => o.id !== deleteTargetId));
    } catch (err) { setServerError('No se pudo conectar con el servidor'); }
    finally { setShowDeleteConfirm(false); setDeleteTargetId(null); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || 'Error al actualizar estado'); return; }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) { setServerError('Fallo de red'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setServerError('');
    const sectionMap = { products: 'products', plans: 'plans', areas: 'features' };
    const apiSection = sectionMap[activeSection] || activeSection;
    let url = modalMode === 'add' ? `${API_BASE_URL}/api/${apiSection}` : `${API_BASE_URL}/api/${apiSection}/${editId}`;
    let method = modalMode === 'add' ? 'POST' : 'PUT';
    let body = {};

    if (activeSection === 'products') body = { name: productForm.name, price: parseFloat(productForm.price), category: productForm.category, description: productForm.description, features: productForm.features.split(',').map(f => f.trim()).filter(Boolean) };
    else if (activeSection === 'plans') body = { name: planForm.name, description: planForm.description, price: parseFloat(planForm.price), icon: planForm.icon, goals: planForm.goals.split(',').map(g => g.trim()).filter(Boolean), bestFor: planForm.bestFor };
    else body = { title: featureForm.title, area: featureForm.area, icon: featureForm.icon, desc: featureForm.desc };

    try {
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || 'Error en el servidor'); return; }
      if (activeSection === 'products') { if (modalMode === 'add') setProducts(prev => [...prev, data]); else setProducts(prev => prev.map(p => p.id === editId ? data : p)); }
      else if (activeSection === 'plans') { if (modalMode === 'add') setPlans(prev => [...prev, data]); else setPlans(prev => prev.map(p => p.id === editId ? data : p)); }
      else { if (modalMode === 'add') setFeatures(prev => [...prev, data]); else setFeatures(prev => prev.map(f => f.id === editId ? data : f)); }
      setShowModal(false);
    } catch (err) { setServerError('Fallo de red'); }
  };

  const storeOrders = orders.filter(o => o.order_type === 'store');
  const cafeOrders = orders.filter(o => o.order_type === 'cafe');
  const pendingStore = storeOrders.filter(o => o.status === 'pending').length;
  const pendingCafe = cafeOrders.filter(o => o.status === 'pending').length;

  const sidebarItems = [
    { id: 'dashboard', icon: '⚡', label: 'Resumen' },
    { id: 'users', icon: '🛡️', label: 'Guerreros', count: users.length },
    { id: 'payments', icon: '💰', label: 'Pagos e Ingresos', count: payments.length },
    { id: 'progress', icon: '📈', label: 'Progreso', count: measurements.length },
    { id: 'cafe_orders', icon: '👨‍🍳', label: 'Barra', count: pendingCafe },
    { id: 'orders', icon: '📦', label: 'Pedidos', count: pendingStore },
    { id: 'products', icon: '🛍️', label: 'Tienda', count: products.length },
    { id: 'plans', icon: '⚔️', label: 'Planes', count: plans.length },
    { id: 'areas', icon: '🗺️', label: 'Zonas', count: features.length },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalPaymentsRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0c10', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? '260px' : '70px',
        background: 'linear-gradient(180deg, #0f1318 0%, #0a0c10 100%)',
        borderRight: '1px solid rgba(20,156,144,0.15)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, overflow: 'hidden'
      }}>
        {/* Logo area */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(20,156,144,0.1)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
          <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>ᛟ</div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#14b8a6', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Valhalla</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Admin Console</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem', flexShrink: 0, transition: 'background 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'rgba(20,184,166,0.15)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                marginBottom: '4px', textAlign: 'left', transition: 'all 0.2s',
                background: activeSection === item.id ? 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,156,144,0.1))' : 'transparent',
                color: activeSection === item.id ? '#14b8a6' : 'rgba(255,255,255,0.55)',
                borderLeft: activeSection === item.id ? '2px solid #14b8a6' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={{ fontSize: '0.875rem', fontWeight: activeSection === item.id ? '600' : '400', whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span style={{ marginLeft: 'auto', background: activeSection === item.id ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)', color: activeSection === item.id ? '#5eead4' : 'rgba(255,255,255,0.4)', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '12px', fontWeight: '600' }}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(20,156,144,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
              {currentUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.username}</div>
                <div style={{ color: '#14b8a6', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Administrador</div>
              </div>
            )}
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ marginLeft: sidebarOpen ? '260px' : '70px', flex: 1, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', minHeight: '100vh' }}>

        {/* Top bar */}
        <header style={{ background: 'rgba(15,19,24,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(20,156,144,0.1)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
              {sidebarItems.find(n => n.id === activeSection)?.icon} {sidebarItems.find(n => n.id === activeSection)?.label}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', margin: 0, letterSpacing: '0.5px' }}>
              Panel de administración — Valhalla Gym
            </p>
          </div>
          {serverError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}>
              {serverError}
            </div>
          )}
        </header>

        <div style={{ padding: '32px' }}>

          {/* ── DASHBOARD ── */}
          {activeSection === 'dashboard' && (() => {
            const renderStatCard = (title, val, icn, clr, subtitle) => (
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${clr}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{icn}</span>
                  <span style={{ background: `${clr}18`, color: clr, fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Activo</span>
                </div>
                <div style={{ color: clr, fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '8px' }}>{title} · {subtitle}</div>
              </div>
            );
            return (
            <div>
              <div className="grid-responsive-2" style={{ gap: '24px' }}>
                {renderStatCard('Usuarios', users.length, '🛡️', '#22c55e', `${measurements.length} progresos`)}
                {renderStatCard('Cafetería', pendingCafe, '👨‍🍳', '#f59e0b', `${cafeOrders.length} ordenes totales`)}
                {renderStatCard('Pedidos Tienda', pendingStore, '📦', '#8b5cf6', `${storeOrders.length} totales`)}
                {renderStatCard('Productos', products.length, '🛍️', '#14b8a6', `3 categorías`)}
              </div>

              {/* Recent orders */}
              <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>📦 Pedidos de Tienda Recientes</h3>
                  <button onClick={() => setActiveSection('orders')} style={{ background: 'none', border: 'none', color: '#14b8a6', fontSize: '0.82rem', cursor: 'pointer', fontWeight: '600' }}>Ver Todos →</button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {storeOrders.slice(0, 3).map(ord => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px', color: '#fff', fontSize: '0.85rem' }}>@{ord.username}</td>
                          <td style={{ padding: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{ord.products.length} items</td>
                          <td style={{ padding: '16px', color: '#14b8a6', fontWeight: '700', textAlign: 'right', fontSize: '0.9rem' }}>${ord.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      {storeOrders.length === 0 && (
                        <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>Sin pedidos registrados aún</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            );
          })()}

          {/* ── STORE ORDERS ── */}
          {activeSection === 'orders' && (
            <AdminTable
              title="Pedidos de Tienda"
              columns={['Guerrero / Fecha', 'Productos', 'Contacto / Dirección', 'Total', 'Estado', 'Acciones']}
            >
              {storeOrders.map(ord => (
                <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.875rem' }}>@{ord.username.toUpperCase()}</span>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>{formatDate(ord.date)}</div>
                  </td>
                  <td style={tdStyle}>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                      {ord.products.map((p, i) => <li key={i}>{p.quantity}× {p.name}</li>)}
                    </ul>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ color: '#fff', fontSize: '0.82rem' }}>📞 {ord.phone}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: '2px' }}>📍 {ord.address}</div>
                  </td>
                  <td style={{ ...tdStyle, color: '#14b8a6', fontWeight: '700', fontSize: '1.05rem' }}>${ord.total.toFixed(2)}</td>
                  <td style={tdStyle}>
                    <span style={{ background: ord.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: ord.status === 'pending' ? '#fbbf24' : '#34d399', border: `1px solid ${ord.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {ord.status === 'pending' ? '⏳ Pendiente' : '✓ Entregado'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      {ord.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(ord.id, 'delivered')} style={{ ...btnStyle, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>✓ Entregar</button>
                      )}
                      {ord.phone && (
                        <button onClick={() => sendOrderPromo(ord)} style={{ ...btnStyle, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>💬 Promo</button>
                      )}
                      <button onClick={() => handleDeleteTrigger(ord.id, 'orders')} style={{ ...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {storeOrders.length === 0 && <EmptyRow cols={6} msg="Sin pedidos de tienda registrados" />}
            </AdminTable>
          )}

          {/* ── CAFE ORDERS ── */}
          {activeSection === 'cafe_orders' && (
            <AdminTable
              title="👨‍🍳 Pedidos de Cafetería (En Vivo)"
              columns={['Guerrero / Hora', 'Pedido', 'Ubicación', 'Total', 'Estado', 'Acciones']}
            >
              {cafeOrders.map(ord => (
                <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.875rem' }}>@{ord.username.toUpperCase()}</span>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>
                      {new Date(ord.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                      {ord.products.map((p, i) => <li key={i}>{p.quantity}× {p.name}</li>)}
                    </ul>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 'bold' }}>{ord.address}</div>
                  </td>
                  <td style={{ ...tdStyle, color: '#14b8a6', fontWeight: '700', fontSize: '1.05rem' }}>${ord.total.toFixed(2)}</td>
                  <td style={tdStyle}>
                    <span style={{ background: ord.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: ord.status === 'pending' ? '#fbbf24' : '#34d399', border: `1px solid ${ord.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {ord.status === 'pending' ? '🔥 Preparando' : '✓ Entregado'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      {ord.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(ord.id, 'delivered')} style={{ ...btnStyle, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>✓ Terminado</button>
                      )}
                      <button onClick={() => handleDeleteTrigger(ord.id, 'orders')} style={{ ...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {cafeOrders.length === 0 && <EmptyRow cols={6} msg="Sin pedidos en cafetería por ahora" />}
            </AdminTable>
          )}

          {/* ── PRODUCTS ── */}
          {activeSection === 'products' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={() => handleOpenAdd('products')} style={primaryBtn}>+ Nuevo Producto</button>
              </div>
              <AdminTable title="Inventario de Productos" columns={['Nombre', 'Precio', 'Categoría', 'Descripción', 'Acciones']}>
                {products.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, color: '#fff', fontWeight: '600' }}>{prod.name}</td>
                    <td style={{ ...tdStyle, color: '#14b8a6', fontWeight: '700' }}>${prod.price.toFixed(2)}</td>
                    <td style={tdStyle}><CategoryBadge cat={prod.category} /></td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', maxWidth: '260px' }}>{prod.description.substring(0, 70)}…</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenEdit(prod, 'products')} style={{ ...btnStyle, background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)' }}>Editar</button>
                        <button onClick={() => handleDeleteTrigger(prod.id, 'products')} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <EmptyRow cols={5} msg="Sin productos en la armería" />}
              </AdminTable>
            </>
          )}

          {/* ── PLANS ── */}
          {activeSection === 'plans' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={() => handleOpenAdd('plans')} style={primaryBtn}>+ Nuevo Plan</button>
              </div>
              <AdminTable title="Planes de Entrenamiento" columns={['Runa', 'Nombre', 'Precio/mes', 'Objetivos', 'Acciones']}>
                {plans.map(plan => (
                  <tr key={plan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontSize: '1.8rem', color: '#14b8a6' }}>{plan.icon}</td>
                    <td style={{ ...tdStyle, color: '#fff', fontWeight: '600' }}>{plan.name}</td>
                    <td style={{ ...tdStyle, color: '#14b8a6', fontWeight: '700' }}>${plan.price.toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', maxWidth: '260px' }}>{plan.goals.slice(0, 2).join(' · ')}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenEdit(plan, 'plans')} style={{ ...btnStyle, background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)' }}>Editar</button>
                        <button onClick={() => handleDeleteTrigger(plan.id, 'plans')} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && <EmptyRow cols={5} msg="Sin planes registrados" />}
              </AdminTable>
            </>
          )}

          {/* ── AREAS ── */}
          {activeSection === 'areas' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={() => handleOpenAdd('areas')} style={primaryBtn}>+ Nueva Área</button>
              </div>
              <AdminTable title="Áreas del Gimnasio" columns={['Icono', 'Título', 'Área/Categoría', 'Descripción', 'Acciones']}>
                {features.map(feat => (
                  <tr key={feat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontSize: '1.6rem' }}>{feat.icon}</td>
                    <td style={{ ...tdStyle, color: '#fff', fontWeight: '600' }}>{feat.title}</td>
                    <td style={{ ...tdStyle, color: '#fbbf24', fontSize: '0.82rem', fontWeight: '600' }}>{feat.area}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', maxWidth: '280px' }}>{feat.desc.substring(0, 70)}…</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenEdit(feat, 'areas')} style={{ ...btnStyle, background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)' }}>Editar</button>
                        <button onClick={() => handleDeleteTrigger(feat.id, 'features')} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {features.length === 0 && <EmptyRow cols={5} msg="Sin áreas registradas" />}
              </AdminTable>
            </>
          )}

          {/* ── USERS ── */}
          {activeSection === 'users' && (
            <div className="grid-responsive-sidebar-right-sm" style={{ alignItems: 'start' }}>
              {/* Users table */}
              <AdminTable title="Usuarios Registrados" columns={['Usuario', 'Rol', 'Teléfono', 'Membresía', 'Ficha Médica', 'Acciones']}>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#14b8a6,#0f766e)' : 'linear-gradient(135deg,#6366f1,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.875rem' }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ background: u.role === 'admin' ? 'rgba(20,184,166,0.15)' : 'rgba(99,102,241,0.15)', color: u.role === 'admin' ? '#14b8a6' : '#818cf8', border: `1px solid ${u.role === 'admin' ? 'rgba(20,184,166,0.3)' : 'rgba(99,102,241,0.3)'}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {u.role === 'admin' ? '⚡ Admin' : '👤 Usuario'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{u.phone || '—'}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', verticalAlign: 'top' }}>
                      {u.role === 'user' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                            <strong>Plan:</strong> {plans.find(p => p.id === u.membership_plan_id)?.name || 'Ninguno'}
                          </div>
                          <div>
                            <span style={{ 
                              background: u.membership_status === 'active' ? 'rgba(52,211,153,0.12)' : u.membership_status === 'expired' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                              color: u.membership_status === 'active' ? '#34d399' : u.membership_status === 'expired' ? '#f87171' : 'rgba(255,255,255,0.4)',
                              padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', border: `1px solid ${u.membership_status === 'active' ? 'rgba(52,211,153,0.2)' : u.membership_status === 'expired' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`
                            }}>
                              {u.membership_status === 'active' ? 'ACTIVA ✓' : u.membership_status === 'expired' ? 'VENCIDA ❌' : 'SIN PLAN'}
                            </span>
                          </div>
                          {u.membership_end_date && (
                            <div style={{ fontSize: '0.72rem', color: u.membership_status === 'expired' ? '#fca5a5' : 'rgba(255,255,255,0.45)' }}>
                              Vence: <strong>{u.membership_end_date}</strong>
                            </div>
                          )}
                          {u.phone && u.membership_status && u.membership_status !== 'none' && (
                            <button
                              onClick={() => {
                                const cleanPhone = u.phone.replace(/\D/g, '');
                                const text = `Hola Guerrero(a) ${u.username}, te saludamos de Valhala Gym ⚔️. Te recordamos que tu mensualidad vence el ${u.membership_end_date || 'pronto'}. ¡No detengas tu entrenamiento en el templo de la fuerza!`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              style={{
                                marginTop: '6px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px',
                                padding: '3px 8px', fontSize: '0.68rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'start', transition: 'background 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#20ba5a'}
                              onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                            >
                              💬 Enviar Recordatorio
                            </button>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', maxWidth: '200px', whiteSpace: 'normal' }}>
                      {u.medical_conditions ? <div style={{ color: '#f87171' }}>⚠️ {u.medical_conditions}</div> : null}
                      {u.surgeries ? <div style={{ color: '#fbbf24' }}>✂️ {u.surgeries}</div> : null}
                      {u.emergency_contact ? <div style={{ color: '#34d399' }}>📞 SOS: {u.emergency_contact}</div> : null}
                      {!u.medical_conditions && !u.surgeries && !u.emergency_contact && '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleEditUserClick(u)} style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Editar</button>
                        <button onClick={() => handleResetPassword(u.id, u.username)} style={{ ...btnStyle, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>🔑 Reset Clave</button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.id)} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <EmptyRow cols={6} msg="Sin usuarios registrados" />}
              </AdminTable>

              {/* Create/Edit user form */}
              <div id="user-form-container" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{editUserId ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>Solo el administrador puede gestionar guerreros</p>
                  </div>
                  {editUserId && (
                    <button type="button" onClick={() => { setEditUserId(null); setUserForm({ username: '', password: '', role: 'user', phone: '', surgeries: '', medical_conditions: '', emergency_contact: '', birth_date: '' }); }} style={{ ...btnStyle, background: 'rgba(255,255,255,0.1)' }}>Cancelar</button>
                  )}
                </div>
                <form onSubmit={handleSaveUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>{userError}</div>}
                  {userSuccess && <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>{userSuccess}</div>}

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Nombre de usuario</label>
                    <input type="text" required value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="Ej: thor_warrior" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Contraseña</label>
                    <input type="password" required={!editUserId} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder={editUserId ? "Dejar en blanco para no cambiar..." : "Contraseña segura..."} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Rol</label>
                    <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="user">👤 Usuario</option>
                      <option value="admin">⚡ Administrador</option>
                    </select>
                  </div>
                  
                  {userForm.role === 'user' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ color: '#14b8a6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>📋 Ficha Médica y Contacto</h4>
                      
                      <div className="grid-responsive-2" style={{ gap: '12px' }}>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Teléfono (WhatsApp)</label>
                          <input type="tel" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="+52 55..." style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Fecha de Nacimiento</label>
                          <input type="date" value={userForm.birth_date} onChange={e => setUserForm({ ...userForm, birth_date: e.target.value })} style={inputStyle} />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Contacto de Emergencia</label>
                        <input type="text" value={userForm.emergency_contact} onChange={e => setUserForm({ ...userForm, emergency_contact: e.target.value })} placeholder="Nombre y teléfono..." style={inputStyle} />
                      </div>
                      
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Cirugías Previas</label>
                        <input type="text" value={userForm.surgeries} onChange={e => setUserForm({ ...userForm, surgeries: e.target.value })} placeholder="Ej: Rodilla (2020), Ninguna..." style={inputStyle} />
                      </div>
                      
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Condiciones Médicas / Lesiones</label>
                        <textarea value={userForm.medical_conditions} onChange={e => setUserForm({ ...userForm, medical_conditions: e.target.value })} placeholder="Ej: Hipertensión, asma, escoliosis leve..." style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                      </div>

                      <h4 style={{ color: '#14b8a6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '12px 0 0 0' }}>⚔️ Plan y Estatus de Membresía</h4>
                      
                      <div className="grid-responsive-2" style={{ gap: '12px' }}>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Plan Asignado</label>
                          <select value={userForm.membership_plan_id || ''} onChange={e => setUserForm({ ...userForm, membership_plan_id: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="">Sin Plan / Inactivo</option>
                            {plans.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Estado Membresía</label>
                          <select value={userForm.membership_status || 'none'} onChange={e => setUserForm({ ...userForm, membership_status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="none">Sin plan / Inactiva</option>
                            <option value="active">Activa ✓</option>
                            <option value="expired">Vencida ❌</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-responsive-2" style={{ gap: '12px' }}>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Inicio del Período</label>
                          <input type="date" value={userForm.membership_start_date || ''} onChange={e => setUserForm({ ...userForm, membership_start_date: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Vencimiento Período</label>
                          <input type="date" value={userForm.membership_end_date || ''} onChange={e => setUserForm({ ...userForm, membership_end_date: e.target.value })} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" style={{ ...primaryBtn, width: '100%', marginTop: '4px' }}>
                    {editUserId ? '💾 Guardar Cambios' : 'Registrar Guerrero ⚔️'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── PAYMENTS & INCOMES ── */}
          {activeSection === 'payments' && (
            <div className="grid-responsive-sidebar-right-sm" style={{ alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Financial Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(20,184,166,0.02))', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Ingresos Totales (Membresías)</div>
                    <div style={{ color: '#5eead4', fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
                      ${totalPaymentsRevenue.toFixed(2)} USD
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Cobros Registrados</div>
                    <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
                      {payments.length} transacciones
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Ingresos de Este Mes</div>
                    <div style={{ color: '#34d399', fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
                      ${(() => {
                        const currentMonth = new Date().toISOString().substring(0, 7);
                        return payments.filter(p => p.payment_date && p.payment_date.startsWith(currentMonth)).reduce((sum, p) => sum + p.amount, 0).toFixed(2);
                      })()} USD
                    </div>
                  </div>
                </div>

                {/* Monthly Income Breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px 0' }}>📊 Desglose de Ingresos por Mes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(() => {
                      const monthly = {};
                      payments.forEach(p => {
                        const m = p.payment_date ? p.payment_date.substring(0, 7) : 'Sin fecha';
                        monthly[m] = (monthly[m] || 0) + p.amount;
                      });
                      const sortedMonths = Object.keys(monthly).sort().reverse();
                      if (sortedMonths.length === 0) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', margin: 0 }}>Aún no hay cobros registrados.</p>;
                      
                      return sortedMonths.map(m => (
                        <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.85rem' }}>{m}</span>
                          <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>${monthly[m].toFixed(2)} USD</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Payments Table */}
                <AdminTable title="Historial de Cobros de Mensualidades" columns={['Fecha', 'Guerrero', 'Plan', 'Monto', 'Notas', 'Acciones']}>
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{p.payment_date}</td>
                      <td style={{ ...tdStyle, color: '#e2e8f0', fontSize: '0.85rem' }}>{p.username}</td>
                      <td style={tdStyle}>
                        <span style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '700' }}>
                          {p.plan_name}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#34d399', fontSize: '0.875rem', fontWeight: '700' }}>${p.amount.toFixed(2)} USD</td>
                      <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', maxWidth: '150px', whiteSpace: 'normal' }}>{p.notes || '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button onClick={() => handleDeletePayment(p.id)} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && <EmptyRow cols={6} msg="Sin cobros registrados" />}
                </AdminTable>
              </div>

              {/* Register Payment Form */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflowX: 'auto' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>💰 Registrar Cobro de Mensualidad</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>Esto renovará la membresía del usuario por 30 días</p>
                </div>
                
                <form onSubmit={handleSavePayment} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {paymentError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>{paymentError}</div>}
                  {paymentSuccess && <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>{paymentSuccess}</div>}

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Guerrero (Socio)</label>
                    <select required value={paymentForm.user_id} onChange={e => setPaymentForm({ ...paymentForm, user_id: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">-- Selecciona un guerrero --</option>
                      {users.filter(u => u.role === 'user').map(u => (
                        <option key={u.id} value={u.id}>
                          {u.username} {u.phone ? `(${u.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Plan a Renovar</label>
                    <select required value={paymentForm.plan_id} onChange={e => {
                      const selectedPlan = plans.find(p => p.id === e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        plan_id: e.target.value,
                        amount: selectedPlan ? selectedPlan.price.toString() : ''
                      });
                    }} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">-- Selecciona un plan --</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price} USD)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Monto Pagado ($ USD)</label>
                    <input type="number" step="0.01" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Ej: 39.99" style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Fecha de Pago</label>
                    <input type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Notas o Comentario</label>
                    <textarea value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Ej: Pago en efectivo barra, transferencia, etc." style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                  </div>

                  <button type="submit" style={{ ...primaryBtn, width: '100%', marginTop: '4px' }}>
                    Registrar Cobro y Activar 💰
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── PROGRESS / MEASUREMENTS ── */}
          {activeSection === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Header + user selector */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px 28px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>📊 Seguimiento de Progreso</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '4px', marginBottom: 0 }}>Selecciona un guerrero para registrar y visualizar su evolución física</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Buscar:</label>
                  <input
                    type="text"
                    placeholder="Escribe para buscar..."
                    value={searchUserQuery}
                    onChange={e => {
                      setSearchUserQuery(e.target.value);
                      const query = e.target.value.toLowerCase().trim();
                      const matched = users.filter(u => u.role === 'user' && u.username.toLowerCase().includes(query));
                      if (matched.length === 1) {
                        setSelectedUserId(matched[0].id);
                      }
                    }}
                    style={{ ...inputStyle, width: '180px', padding: '10px 14px' }}
                  />
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Guerrero:</label>
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    style={{ ...inputStyle, minWidth: '200px', maxWidth: '260px', cursor: 'pointer', padding: '10px 14px' }}
                  >
                    <option value="">-- Seleccionar usuario --</option>
                    {users
                      .filter(u => u.role === 'user' && u.username.toLowerCase().includes(searchUserQuery.toLowerCase().trim()))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {selectedUserId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                  {/* LEFT: History Table + Calculated Metrics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Latest Calculated Metrics */}
                    {measurements.length > 0 && (() => {
                      const last = measurements[0];
                      const m = calcMetrics(last);
                      const metricCards = [
                        m.bmi && { label: 'IMC', value: m.bmi, sub: m.bmiCat?.label, color: m.bmiCat?.color, bg: m.bmiCat?.bg, icon: '⚖️' },
                        m.leanMass && { label: 'Masa Magra', value: `${m.leanMass} kg`, sub: 'músculo + hueso', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '💪' },
                        m.fatMass && { label: 'Masa Grasa', value: `${m.fatMass} kg`, sub: `${last.body_fat}% del total`, color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: '🔥' },
                        m.icc && { label: 'Índice C-C', value: m.icc, sub: m.iccRisk?.label, color: m.iccRisk?.color, bg: m.iccRisk?.bg, icon: '📐' },
                        m.ict && { label: 'Índice C-T', value: m.ict, sub: m.ictRisk?.label, color: m.ictRisk?.color, bg: m.ictRisk?.bg, icon: '📏' },
                        m.bp && { label: 'Presión', value: m.bp, sub: m.bpCat?.label, color: m.bpCat?.color, bg: m.bpCat?.bg, icon: '❤️' },
                        m.hr && { label: 'FC Reposo', value: `${m.hr} bpm`, sub: m.hrCat?.label, color: m.hrCat?.color, bg: m.hrCat?.bg, icon: '💓' },
                        m.bmr && { label: 'TMB', value: `${m.bmr} kcal`, sub: 'metabolismo basal', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: '⚡' },
                        m.tdeeModerate && { label: 'Mant. Moderado', value: `${m.tdeeModerate} kcal`, sub: 'actividad moderada', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: '🍽️' },
                        m.armAsym !== undefined && { label: 'Asimetría Bíceps', value: `${m.armAsym} cm`, sub: m.armAsym > 1 ? 'Diferencia notable' : 'Equilibrado ✓', color: parseFloat(m.armAsym) > 1 ? '#fbbf24' : '#34d399', bg: parseFloat(m.armAsym) > 1 ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', icon: '↔️' },
                      ].filter(Boolean);

                      return (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
                          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(90deg, rgba(20,184,166,0.08), transparent)' }}>
                            <span style={{ fontSize: '1rem' }}>🧮</span>
                            <div>
                              <h3 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>Métricas Calculadas Automáticamente</h3>
                              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', margin: 0 }}>Derivadas del último registro — {new Date(last.date).toLocaleDateString('es-MX')}</p>
                            </div>
                          </div>
                          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                            {metricCards.map((card, i) => (
                              <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}25`, borderRadius: '10px', padding: '12px 14px' }}>
                                <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{card.icon}</div>
                                <div style={{ color: card.color, fontWeight: '800', fontSize: '1rem', lineHeight: 1 }}>{card.value}</div>
                                {card.sub && <div style={{ color: card.color, fontSize: '0.62rem', fontWeight: '600', marginTop: '3px', opacity: 0.8 }}>{card.sub}</div>}
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{card.label}</div>
                              </div>
                            ))}
                            {metricCards.length === 0 && (
                              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', gridColumn: '1/-1', padding: '8px 0' }}>Ingresa peso + talla para ver métricas automáticas</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* History Table */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflowX: 'auto' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '700', margin: 0 }}>
                          Historial — @{users.find(u => u.id === selectedUserId)?.username}
                        </h3>
                        <span style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {measurements.length} registros
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {['Fecha', 'Peso', 'Talla', '% Grasa', 'IMC', 'Magra', 'Cintura', 'Pecho', 'PA', 'FC', 'Acc.'].map((h, i) => (
                                <th key={i} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {measurements.map((m, idx) => {
                              const prev = measurements[idx + 1];
                              const calc = calcMetrics(m);
                              const delta = (field) => {
                                if (!prev || m[field] == null || prev[field] == null) return null;
                                const diff = parseFloat((m[field] - prev[field]).toFixed(1));
                                if (diff === 0) return null;
                                return <span style={{ fontSize: '0.6rem', color: diff > 0 ? '#34d399' : '#f87171', marginLeft: '3px' }}>{diff > 0 ? '▲' : '▼'}{Math.abs(diff)}</span>;
                              };
                              const fmt = v => v != null ? v : '—';
                              return (
                                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <td style={{ ...tdStyle, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                    <div style={{ color: '#fff', fontWeight: '600' }}>{new Date(m.date).toLocaleDateString('es-MX')}</div>
                                    {idx === 0 && <span style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6', fontSize: '0.55rem', padding: '1px 5px', borderRadius: '6px', fontWeight: '700' }}>ÚLTIMO</span>}
                                  </td>
                                  <td style={{ ...tdStyle, color: '#fbbf24', fontWeight: '700' }}>{fmt(m.weight)}{delta('weight')}</td>
                                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>{fmt(m.height)}</td>
                                  <td style={{ ...tdStyle, color: '#f87171', fontSize: '0.82rem' }}>{m.body_fat != null ? `${m.body_fat}%` : '—'}{delta('body_fat')}</td>
                                  <td style={{ ...tdStyle }}>
                                    {calc.bmi ? (
                                      <span style={{ background: calc.bmiCat?.bg, color: calc.bmiCat?.color, padding: '2px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                        {calc.bmi}
                                      </span>
                                    ) : '—'}
                                  </td>
                                  <td style={{ ...tdStyle, color: '#10b981', fontSize: '0.82rem' }}>{calc.leanMass ? `${calc.leanMass}` : '—'}</td>
                                  <td style={{ ...tdStyle, color: '#14b8a6', fontSize: '0.82rem' }}>{fmt(m.waist)}{delta('waist')}</td>
                                  <td style={{ ...tdStyle, color: '#14b8a6', fontSize: '0.82rem' }}>{fmt(m.chest)}{delta('chest')}</td>
                                  <td style={{ ...tdStyle, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                    {m.systolic && m.diastolic ? (
                                      <span style={{ color: calc.bpCat?.color }}>{m.systolic}/{m.diastolic}</span>
                                    ) : '—'}
                                  </td>
                                  <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
                                    {m.resting_hr ? <span style={{ color: calc.hrCat?.color }}>{m.resting_hr}</span> : '—'}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <button onClick={() => handleDeleteMeas(m.id)} style={{ ...btnStyle, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px' }}>✕</button>
                                  </td>
                                </tr>
                              );
                            })}
                            {measurements.length === 0 && (
                              <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>Sin medidas registradas para este guerrero</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: New Measurement Form */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(20,184,166,0.08), transparent)' }}>
                      <h3 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '700', margin: 0 }}>➕ Registrar Medidas</h3>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '3px', marginBottom: 0 }}>
                        Guerrero: <strong style={{ color: '#14b8a6' }}>@{users.find(u => u.id === selectedUserId)?.username}</strong>
                      </p>
                    </div>
                    <form onSubmit={handleMeasSubmit} style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {measError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '9px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>{measError}</div>}
                      {measSuccess && <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '9px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>{measSuccess}</div>}

                      {/* Fecha + Perfil */}
                      <MeasSection label="📅 Fecha y Perfil">
                        <MeasField label="Fecha"><input type="date" value={measForm.date} onChange={e => setMeasForm({ ...measForm, date: e.target.value })} style={inputStyle} /></MeasField>
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Género">
                            <select value={measForm.gender} onChange={e => setMeasForm({ ...measForm, gender: e.target.value })} style={{ ...inputStyle, padding: '8px 10px', cursor: 'pointer' }}>
                              <option value="">—</option>
                              <option value="masculino">♂ Masculino</option>
                              <option value="femenino">♀ Femenino</option>
                            </select>
                          </MeasField>
                          <MeasField label="Edad (años)"><input type="number" min="10" max="100" value={measForm.age} onChange={e => setMeasForm({ ...measForm, age: e.target.value })} placeholder="25" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                      </MeasSection>

                      {/* Composición corporal */}
                      <MeasSection label="⚖️ Composición Corporal">
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Peso (kg)"><input type="number" step="0.1" min="0" value={measForm.weight} onChange={e => setMeasForm({ ...measForm, weight: e.target.value })} placeholder="80.5" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Talla (cm)"><input type="number" step="0.1" min="0" value={measForm.height} onChange={e => setMeasForm({ ...measForm, height: e.target.value })} placeholder="175" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="% Grasa Corporal"><input type="number" step="0.1" min="0" max="70" value={measForm.body_fat} onChange={e => setMeasForm({ ...measForm, body_fat: e.target.value })} placeholder="18.5" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Cuello (cm)"><input type="number" step="0.1" min="0" value={measForm.neck} onChange={e => setMeasForm({ ...measForm, neck: e.target.value })} placeholder="38" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                        {/* Live IMC preview */}
                        {measForm.weight && measForm.height && (() => {
                          const liveM = calcMetrics(measForm);
                          if (!liveM.bmi) return null;
                          return (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <span style={{ background: liveM.bmiCat?.bg, color: liveM.bmiCat?.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>IMC: {liveM.bmi} — {liveM.bmiCat?.label}</span>
                              {liveM.leanMass && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>Magra: {liveM.leanMass} kg</span>}
                              {liveM.fatMass && <span style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>Grasa: {liveM.fatMass} kg</span>}
                            </div>
                          );
                        })()}
                      </MeasSection>

                      {/* Torso */}
                      <MeasSection label="🛡️ Torso (cm)">
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Pecho"><input type="number" step="0.1" min="0" value={measForm.chest} onChange={e => setMeasForm({ ...measForm, chest: e.target.value })} placeholder="100" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Hombros"><input type="number" step="0.1" min="0" value={measForm.shoulders} onChange={e => setMeasForm({ ...measForm, shoulders: e.target.value })} placeholder="115" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Cintura"><input type="number" step="0.1" min="0" value={measForm.waist} onChange={e => setMeasForm({ ...measForm, waist: e.target.value })} placeholder="80" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Caderas"><input type="number" step="0.1" min="0" value={measForm.hips} onChange={e => setMeasForm({ ...measForm, hips: e.target.value })} placeholder="95" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                        {measForm.waist && measForm.hips && (() => {
                          const liveM = calcMetrics(measForm);
                          return liveM.icc ? (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <span style={{ background: liveM.iccRisk?.bg, color: liveM.iccRisk?.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>ICC: {liveM.icc} — {liveM.iccRisk?.label}</span>
                              {liveM.ict && <span style={{ background: liveM.ictRisk?.bg, color: liveM.ictRisk?.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>ICT: {liveM.ict} — {liveM.ictRisk?.label}</span>}
                            </div>
                          ) : null;
                        })()}
                      </MeasSection>

                      {/* Brazos */}
                      <MeasSection label="💪 Brazos (cm)">
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Bíceps Izq."><input type="number" step="0.1" min="0" value={measForm.biceps_left} onChange={e => setMeasForm({ ...measForm, biceps_left: e.target.value })} placeholder="35" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Bíceps Der."><input type="number" step="0.1" min="0" value={measForm.biceps_right} onChange={e => setMeasForm({ ...measForm, biceps_right: e.target.value })} placeholder="35" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                      </MeasSection>

                      {/* Piernas */}
                      <MeasSection label="🏃 Piernas (cm)">
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Muslo Izq."><input type="number" step="0.1" min="0" value={measForm.thighs_left} onChange={e => setMeasForm({ ...measForm, thighs_left: e.target.value })} placeholder="56" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Muslo Der."><input type="number" step="0.1" min="0" value={measForm.thighs_right} onChange={e => setMeasForm({ ...measForm, thighs_right: e.target.value })} placeholder="56" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Gemelo Izq."><input type="number" step="0.1" min="0" value={measForm.calves_left} onChange={e => setMeasForm({ ...measForm, calves_left: e.target.value })} placeholder="36" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Gemelo Der."><input type="number" step="0.1" min="0" value={measForm.calves_right} onChange={e => setMeasForm({ ...measForm, calves_right: e.target.value })} placeholder="36" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                      </MeasSection>

                      {/* Cardiovascular */}
                      <MeasSection label="❤️ Salud Cardiovascular">
                        <div className="grid-responsive-3" style={{ gap: '8px' }}>
                          <MeasField label="Sistólica"><input type="number" min="60" max="250" value={measForm.systolic} onChange={e => setMeasForm({ ...measForm, systolic: e.target.value })} placeholder="120" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Diastólica"><input type="number" min="40" max="150" value={measForm.diastolic} onChange={e => setMeasForm({ ...measForm, diastolic: e.target.value })} placeholder="80" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="FC Reposo"><input type="number" min="30" max="200" value={measForm.resting_hr} onChange={e => setMeasForm({ ...measForm, resting_hr: e.target.value })} placeholder="65" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                        {(measForm.systolic || measForm.resting_hr) && (() => {
                          const liveM = calcMetrics(measForm);
                          return (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                              {liveM.bpCat && <span style={{ background: liveM.bpCat.bg, color: liveM.bpCat.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>PA: {liveM.bp} — {liveM.bpCat.label}</span>}
                              {liveM.hrCat && <span style={{ background: liveM.hrCat.bg, color: liveM.hrCat.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>FC: {liveM.hrCat.label}</span>}
                            </div>
                          );
                        })()}
                      </MeasSection>

                      {/* Estilo de vida */}
                      <MeasSection label="🌙 Estilo de Vida y Entrenamiento">
                        <MeasField label="Objetivo Principal">
                          <select value={measForm.goal} onChange={e => setMeasForm({ ...measForm, goal: e.target.value })} style={{ ...inputStyle, padding: '8px 10px', cursor: 'pointer' }}>
                            <option value="">— Sin especificar —</option>
                            <option value="perdida_grasa">🔥 Pérdida de Grasa</option>
                            <option value="hipertrofia">💪 Hipertrofia / Volumen</option>
                            <option value="fuerza">🏋️ Fuerza Máxima</option>
                            <option value="resistencia">🏃 Resistencia / Cardio</option>
                            <option value="mantenimiento">⚖️ Mantenimiento</option>
                            <option value="recomposicion">🔄 Recomposición Corporal</option>
                          </select>
                        </MeasField>
                        <div className="grid-responsive-2" style={{ gap: '8px' }}>
                          <MeasField label="Nivel de energía (1-10)"><input type="number" min="1" max="10" value={measForm.energy_level} onChange={e => setMeasForm({ ...measForm, energy_level: e.target.value })} placeholder="7" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Sueño (horas/día)"><input type="number" step="0.5" min="0" max="24" value={measForm.sleep_hours} onChange={e => setMeasForm({ ...measForm, sleep_hours: e.target.value })} placeholder="7.5" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Calorías diarias"><input type="number" min="0" value={measForm.daily_calories} onChange={e => setMeasForm({ ...measForm, daily_calories: e.target.value })} placeholder="2200" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                          <MeasField label="Proteína (g/día)"><input type="number" min="0" value={measForm.daily_protein} onChange={e => setMeasForm({ ...measForm, daily_protein: e.target.value })} placeholder="160" style={{ ...inputStyle, padding: '8px 10px' }} /></MeasField>
                        </div>
                      </MeasSection>

                      {/* Notas */}
                      <div>
                        <MeasField label="📝 Notas del Entrenador">
                          <textarea value={measForm.notes} onChange={e => setMeasForm({ ...measForm, notes: e.target.value })} placeholder="Observaciones, condición física, ajustes al plan..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '68px', fontFamily: 'inherit' }} />
                        </MeasField>
                      </div>

                      <button type="submit" style={{ ...primaryBtn, width: '100%', marginTop: '4px' }}>
                        Guardar Medidas 📊
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {!selectedUserId && (
                <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Selecciona un guerrero del menú superior para ver su progreso</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>


      {/* ── CRUD MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: '#13181f', border: '1px solid rgba(20,156,144,0.25)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                {modalMode === 'add' ? '+ Crear Registro' : '✏️ Editar Registro'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {serverError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>{serverError}</div>}

              {activeSection === 'products' && (
                <>
                  <ModalField label="Nombre del Producto" ><input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ej: Elixir de Odin Premium" style={inputStyle} /></ModalField>
                  <div className="grid-responsive-2">
                    <ModalField label="Precio (USD)"><input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="34.99" style={inputStyle} /></ModalField>
                    <ModalField label="Categoría">
                      <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="supplements">Suplementos</option>
                        <option value="gear">Equipamiento</option>
                        <option value="apparel">Ropa</option>
                        <option value="cafe">Cafetería</option>
                      </select>
                    </ModalField>
                  </div>
                  <ModalField label="Descripción"><input type="text" required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Breve descripción..." style={inputStyle} /></ModalField>
                  <ModalField label="Características (separadas por comas)"><input type="text" value={productForm.features} onChange={e => setProductForm({ ...productForm, features: e.target.value })} placeholder="300mg Cafeína, 6g Citrulina" style={inputStyle} /></ModalField>
                  <ModalField label="Imagen del Producto (Opcional)">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '8px' }} />
                      {productForm.image && <img src={productForm.image} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />}
                    </div>
                  </ModalField>
                </>
              )}
              {activeSection === 'plans' && (
                <>
                  <ModalField label="Nombre del Plan"><input type="text" required value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Plan Berserker Fuerza" style={inputStyle} /></ModalField>
                  <div className="grid-responsive-2">
                    <ModalField label="Precio/mes (USD)"><input type="number" step="0.01" required value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} placeholder="39.99" style={inputStyle} /></ModalField>
                    <ModalField label="Runa / Ícono"><input type="text" required maxLength="3" value={planForm.icon} onChange={e => setPlanForm({ ...planForm, icon: e.target.value })} placeholder="ᚢ" style={inputStyle} /></ModalField>
                  </div>
                  <ModalField label="Descripción"><input type="text" required value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Descripción del plan..." style={inputStyle} /></ModalField>
                  <ModalField label="Objetivos (separados por comas)"><input type="text" value={planForm.goals} onChange={e => setPlanForm({ ...planForm, goals: e.target.value })} placeholder="Hipertrofia, Fuerza máxima" style={inputStyle} /></ModalField>
                </>
              )}
              {activeSection === 'areas' && (
                <>
                  <ModalField label="Título de la Sala"><input type="text" required value={featureForm.title} onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })} placeholder="La Muralla de Escudos" style={inputStyle} /></ModalField>
                  <div className="grid-responsive-2">
                    <ModalField label="Área / Categoría"><input type="text" required value={featureForm.area} onChange={e => setFeatureForm({ ...featureForm, area: e.target.value })} placeholder="Zona de Peso Libre" style={inputStyle} /></ModalField>
                    <ModalField label="Ícono (Emoji)"><input type="text" required maxLength="2" value={featureForm.icon} onChange={e => setFeatureForm({ ...featureForm, icon: e.target.value })} placeholder="🛡️" style={inputStyle} /></ModalField>
                  </div>
                  <ModalField label="Descripción de Actividades"><input type="text" required value={featureForm.desc} onChange={e => setFeatureForm({ ...featureForm, desc: e.target.value })} placeholder="Mancuernas y barras olímpicas..." style={inputStyle} /></ModalField>
                </>
              )}

              <button type="submit" style={{ ...primaryBtn, width: '100%', marginTop: '4px' }}>
                {modalMode === 'add' ? 'Crear Registro ⚔️' : 'Guardar Cambios ✓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div id="delete-confirmation-modal" style={{ background: '#13181f', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>¿Confirmar Eliminación?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '28px' }}>Esta acción es permanente e irreversible. ¿Deseas continuar?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-confirm-delete" onClick={executeDelete} style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem' }}>Eliminar</button>
              <button className="btn-cancel-delete" onClick={() => setShowDeleteConfirm(false)} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ──
const tdStyle = { padding: '16px 20px', verticalAlign: 'middle' };
const btnStyle = { padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap' };
const primaryBtn = { background: 'linear-gradient(135deg, #14b8a6, #0f766e)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.3px', transition: 'opacity 0.2s' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

function AdminTable({ title, columns, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflowX: 'auto' }}>
      {title && (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{title}</h3>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: i === columns.length - 1 ? 'center' : 'left' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyRow({ cols, msg }) {
  return <tr><td colSpan={cols} style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>{msg}</td></tr>;
}

function CategoryBadge({ cat }) {
  const map = { supplements: { label: 'Suplemento', color: '#14b8a6' }, gear: { label: 'Gear', color: '#f59e0b' }, apparel: { label: 'Ropa', color: '#8b5cf6' } };
  const { label, color } = map[cat] || { label: cat, color: '#9ca3af' };
  return <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>;
}

function ModalField({ label, children }) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{label}</label>
      {children}
    </div>
  );
}

function MeasField({ label, children }) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

function MeasSection({ label, children }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', fontWeight: '700' }}>{label}</p>
      {children}
    </div>
  );
}
