import React, { useState, useEffect } from 'react';

export default function Coaching({ plans = [], currentUser }) {
  const [wizardStep, setWizardStep] = useState(0); // 0 = Intro, 1 = Goal, 2 = Experience, 3 = Frequency, 4 = Recommendation
  const [selections, setSelections] = useState({
    goal: '',
    experience: '',
    frequency: ''
  });
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '' });
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Auto-populate name if user is logged in
  useEffect(() => {
    if (showBookingModal && currentUser) {
      setBookingForm(prev => ({
        ...prev,
        name: currentUser.username
      }));
    }
  }, [showBookingModal, currentUser]);

  const handleStartWizard = () => {
    setWizardStep(1);
  };

  const selectGoal = (goal) => {
    setSelections({ ...selections, goal });
    setWizardStep(2);
  };

  const selectExperience = (exp) => {
    setSelections({ ...selections, experience: exp });
    setWizardStep(3);
  };

  const selectFrequency = (freq) => {
    const updatedSelections = { ...selections, frequency: freq };
    setSelections(updatedSelections);
    calculateRecommendation(updatedSelections);
  };

  const calculateRecommendation = (finalSelections) => {
    let recommendation = plans[0]; // Default Berserker
    
    if (finalSelections.goal === 'conditioning') {
      recommendation = plans.find(p => p.bestFor === 'conditioning') || plans[1] || plans[0];
    } else if (finalSelections.goal === 'premium' || finalSelections.experience === 'avanzado') {
      recommendation = plans.find(p => p.bestFor === 'premium') || plans[2] || plans[0];
    }
    
    setRecommendedPlan(recommendation);
    setWizardStep(4);
  };

  const handleReset = () => {
    setSelections({ goal: '', experience: '', frequency: '' });
    setRecommendedPlan(null);
    setWizardStep(0);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const phoneNumber = '573228672583'; // Teléfono oficial en Colombia (+57)
    
    let message = '⚔️ *SOLICITUD DE ASESORÍA PERSONALIZADA - VALHARA GYM* ⚔️\n\n';
    message += `*Guerrero/a:* ${bookingForm.name}\n`;
    message += `*Teléfono:* ${bookingForm.phone}\n`;
    message += `*Email:* ${bookingForm.email}\n\n`;
    message += `*PLAN RECOMENDADO:* ${recommendedPlan.name}\n\n`;
    message += '*DATOS DEL TEST:*\n';
    message += `• Objetivo: ${selections.goal === 'strength' ? 'Fuerza y Músculo' : selections.goal === 'conditioning' ? 'Definición y Cardio' : 'Consejo Completo (Premium)'}\n`;
    message += `• Experiencia: ${selections.experience}\n`;
    message += `• Frecuencia: ${selections.frequency} días/semana\n\n`;
    message += '¡Deseo iniciar mi preparación para entrar a la horda! 🛡️';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setShowBookingModal(false);
  };

  return (
    <section className="coaching section-padding watermark-container" id="coaching">
      {/* Background Runic Watermark: ᛟᚱᚨᚲᛚᛖ (Oracle) */}
      <div className="watermark-text">ᛟᚱᚨᚲᛚᛖ</div>

      <div className="container">
        <div className="section-header text-center">
          <span className="rune-glow">ᚨ ᛋ ᛖ ᛋ ᛟ ᚱ ᛁ ᚨ</span>
          <h2 className="section-title">El Oráculo Rúnico</h2>
          <p className="section-subtitle">
            Obtén un plan de entrenamiento y nutrición adaptado a tus metas rindiendo este test rúnico.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="wizard-container glass">
          {/* Progress bar */}
          {wizardStep > 0 && wizardStep < 4 && (
            <div className="wizard-progress">
              <div className="progress-bar" style={{ width: `${(wizardStep / 3) * 100}%` }}></div>
              <span className="step-indicator">Paso {wizardStep} de 3</span>
            </div>
          )}

          {/* Step 0: Intro */}
          {wizardStep === 0 && (
            <div className="wizard-intro text-center">
              <div className="oracle-rune floating-element">ᛟ</div>
              <h3>Establece tu Plan de Asesoría</h3>
              <p>Responde 3 preguntas sencillas y el oráculo te recomendará la senda de fuerza que te corresponde.</p>
              <button className="btn btn-primary" onClick={handleStartWizard}>
                <span>Consultar Oráculo</span>
              </button>
            </div>
          )}

          {/* Step 1: Goal */}
          {wizardStep === 1 && (
            <div className="wizard-step wizard-step-layout">
              <div className="step-badge-wrapper">
                <div className="giant-step-number">I</div>
              </div>
              <h3 className="step-question text-center">Elige tu Objetivo Primordial</h3>
              <div className="options-grid">
                <button className="option-card" onClick={() => selectGoal('strength')}>
                  <span className="option-rune">ᚢ</span>
                  <h4>Fuerza y Músculo</h4>
                  <p>Ganar tamaño y fuerza bruta en los levantamientos.</p>
                </button>
                <button className="option-card" onClick={() => selectGoal('conditioning')}>
                  <span className="option-rune">ᛖ</span>
                  <h4>Definición y Cardio</h4>
                  <p>Eliminar grasa, potenciar velocidad y resistencia.</p>
                </button>
                <button className="option-card" onClick={() => selectGoal('premium')}>
                  <span className="option-rune">ᚨ</span>
                  <h4>Poder Supremo 1-on-1</h4>
                  <p>Seguimiento estricto diario, nutrición y rutinas dinámicas.</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {wizardStep === 2 && (
            <div className="wizard-step wizard-step-layout">
              <div className="step-badge-wrapper">
                <div className="giant-step-number">II</div>
              </div>
              <h3 className="step-question text-center">Indica tu Nivel con los Fierros</h3>
              <div className="options-grid">
                <button className="option-card" onClick={() => selectExperience('novato')}>
                  <span className="option-rune">ᛁ</span>
                  <h4>Novato</h4>
                  <p>Menos de 6 meses entrenando de forma constante.</p>
                </button>
                <button className="option-card" onClick={() => selectExperience('intermedio')}>
                  <span className="option-rune">ᛃ</span>
                  <h4>Intermedio</h4>
                  <p>De 1 a 3 años de entrenamiento estructurado.</p>
                </button>
                <button className="option-card" onClick={() => selectExperience('avanzado')}>
                  <span className="option-rune">ᛗ</span>
                  <h4>Avanzado</h4>
                  <p>Más de 3 años, domino técnico y periodización fuerte.</p>
                </button>
              </div>
              <button className="btn btn-secondary btn-back" onClick={() => setWizardStep(1)}>
                <span>Atrás</span>
              </button>
            </div>
          )}

          {/* Step 3: Frequency */}
          {wizardStep === 3 && (
            <div className="wizard-step wizard-step-layout">
              <div className="step-badge-wrapper">
                <div className="giant-step-number">III</div>
              </div>
              <h3 className="step-question text-center">Frecuencia Semanal de Batalla</h3>
              <div className="options-grid">
                <button className="option-card" onClick={() => selectFrequency('3')}>
                  <span className="option-rune">ᛟ</span>
                  <h4>3 Días</h4>
                  <p>Ideal para rutinas compactas e intensas Full Body.</p>
                </button>
                <button className="option-card" onClick={() => selectFrequency('4-5')}>
                  <span className="option-rune">ᛟᛟ</span>
                  <h4>4 o 5 Días</h4>
                  <p>Perfecto para una distribución clásica empuje/tirón/piernas.</p>
                </button>
                <button className="option-card" onClick={() => selectFrequency('6')}>
                  <span className="option-rune">ᛟᛟᛟ</span>
                  <h4>6 Días</h4>
                  <p>Frecuencia y volumen elevado para atletas avanzados.</p>
                </button>
              </div>
              <button className="btn btn-secondary btn-back" onClick={() => setWizardStep(2)}>
                <span>Atrás</span>
              </button>
            </div>
          )}

          {/* Step 4: Recommendation */}
          {wizardStep === 4 && recommendedPlan && (
            <div className="wizard-recommendation text-center">
              <div className="rec-badge">
                <span>Tu Recomendación Rúnica</span>
              </div>
              <div className="recommended-rune">{recommendedPlan.icon}</div>
              <h3>{recommendedPlan.name}</h3>
              <p className="rec-desc">{recommendedPlan.description}</p>
              
              <div className="rec-details">
                <h4>Beneficios Clave:</h4>
                <ul>
                  {recommendedPlan.goals.map((goal, index) => (
                    <li key={index}>
                      <span className="accent-text">⚔️</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rec-price">
                <span>Costo del Entrenamiento:</span>
                <h3>${recommendedPlan.price} / mes</h3>
              </div>

              <div className="rec-actions">
                <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
                  <span>Reservar Plan</span>
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>
                  <span>Repetir Test</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Regular Plans Display */}
        <div className="all-plans-grid grid-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card glass ${recommendedPlan?.id === plan.id ? 'highlighted' : ''}`}>
              {recommendedPlan?.id === plan.id && (
                <div className="highlight-tag">
                  <span>Recomendado</span>
                </div>
              )}
              <div className="plan-icon">{plan.icon}</div>
              <h3 className="plan-title">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-divider"></div>
              <ul className="plan-goals">
                {plan.goals.map((g, idx) => (
                  <li key={idx}>
                    <span className="accent-text">✓</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-price">${plan.price}<span>/mes</span></div>
              <button 
                className="btn btn-rune btn-full"
                onClick={() => {
                  setRecommendedPlan(plan);
                  setShowBookingModal(true);
                }}
              >
                <span>Elegir Plan</span>
              </button>
            </div>
          ))}
        </div>

        {/* Booking Form Modal */}
        {showBookingModal && recommendedPlan && (
          <div className="modal-backdrop">
            <div className="modal-content glass">
              <div className="modal-header">
                <h3>Registro de Fuerza - {recommendedPlan.name}</h3>
                <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
              </div>
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <p>Ingresa tus datos y te redireccionaremos a WhatsApp para coordinar tu inicio de entrenamiento.</p>
                <div className="form-group">
                  <label>Nombre Guerrero</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="Ej: Ragnar"
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    placeholder="Ej: +54..."
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    placeholder="Ej: guerrero@valhalla.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  <span>Reclutarme por WhatsApp ⚔️</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
