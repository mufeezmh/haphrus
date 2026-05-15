import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../config/api';
import PaywallModal from '../Subscription/PaywallModal';

const QuestionSection = ({ title, children, style }) => {
  return (
    <div className="quiz-section" style={style}>
      <div className="quiz-section-header">
        <h3>{title}</h3>
      </div>
      <div className="quiz-options-row">
        {children}
      </div>
    </div>
  );
};

const SkinQuiz = () => {
  // Quiz mode: 'skin' or 'hair'
  const [quizMode, setQuizMode] = useState('skin');

  // Skin states
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [sensitivity, setSensitivity] = useState('');
  const [routinePreference, setRoutinePreference] = useState('');

  // Hair states
  const [hairType, setHairType] = useState('');
  const [hairConcerns, setHairConcerns] = useState([]);
  const [scalpCondition, setScalpCondition] = useState('');
  const [hairRoutinePreference, setHairRoutinePreference] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [subStatus, setSubStatus] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  useEffect(() => {
    if (token) {
      fetchSubscriptionStatus();
    }
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubStatus(res.data);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    }
  };

  const handleConcernToggle = (concern) => {
    setConcerns(prev => 
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const handleHairConcernToggle = (concern) => {
    setHairConcerns(prev => 
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleSubmit = async () => {
    if (quizMode === 'skin') {
      if (!skinType || !sensitivity || !routinePreference) {
        alert('Please fill in all fields');
        return;
      }
    } else {
      if (!hairType || !scalpCondition || !hairRoutinePreference) {
        alert('Please fill in all fields');
        return;
      }
    }

    if (!token) {
      navigate('/register');
      return;
    }

    setLoading(true);

    const payload = quizMode === 'skin'
      ? { skinProfile: { skinType, concerns, sensitivity, routinePreference }, quizMode: 'skin' }
      : { hairProfile: { hairType, hairConcerns, scalpCondition, hairRoutinePreference }, quizMode: 'hair' };

    try {
      const res = await axios.post(
        `${API_BASE}/api/recommendations/generate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/recommendations', { state: { advice: res.data.advice, quizMode } });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.message === 'SUBSCRIPTION_REQUIRED') {
        setShowPaywall(true);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('Error generating recommendations: ' + (err.response?.data?.details || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = subStatus?.subscription?.isActive && subStatus?.subscription?.plan !== 'free';
  const freeUsesLeft = subStatus ? Math.max(0, 1 - (subStatus.recommendationCount || 0)) : null;

  return (
    <>
      {/* Top Navigation Bar */}
      <header>
        <nav className="top-nav" role="navigation" aria-label="Main navigation">
          <div className="nav-brand">
            <span className="nav-title">HAPHRUS</span>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user">
                  <span className="nav-avatar">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  {user.name}
                </span>
                {isSubscribed ? (
                  <span className="sub-badge sub-badge-active">
                    ⚡ {subStatus.subscription.plan} plan
                  </span>
                ) : (
                  <button className="btn-upgrade-nav" onClick={() => navigate('/subscribe')}>
                    Upgrade
                  </button>
                )}
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn-nav-link" onClick={() => navigate('/login')}>Login</button>
                <button className="btn-primary btn-nav-signup" onClick={() => navigate('/register')}>Sign Up Free</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container" style={{ paddingTop: '30px', paddingBottom: '50px' }}>
        
        {/* Subscription Status Banner */}
        {user && subStatus && (
          <section className="status-banner animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto 24px' }} aria-label="Subscription status">
            {isSubscribed ? (
              <div className="status-subscribed">
                <div className="status-icon">🎉</div>
                <div>
                  <strong>Pro Member</strong> — You have unlimited AI recommendations
                  <span className="status-plan-tag">{subStatus.subscription.plan}</span>
                </div>
              </div>
            ) : freeUsesLeft !== null && freeUsesLeft > 0 ? (
              <div className="status-free">
                <div className="status-icon">🆓</div>
                <div>
                  <strong>{freeUsesLeft} free recommendation</strong> remaining. 
                  <button className="status-link" onClick={() => navigate('/subscribe')}>
                    Upgrade for unlimited →
                  </button>
                </div>
              </div>
            ) : freeUsesLeft !== null && freeUsesLeft <= 0 ? (
              <div className="status-exhausted">
                <div className="status-icon">🔒</div>
                <div>
                  <strong>Free trial used.</strong>{' '}
                  <button className="status-link" onClick={() => navigate('/subscribe')}>
                    Subscribe to unlock unlimited recommendations →
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        )}

        <section className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }} aria-label="Haphrus recommendation quiz">
          
          {/* Mode Toggle */}
          <div className="quiz-mode-toggle" style={{ marginBottom: '36px' }}>
            <button 
              className={`quiz-mode-btn ${quizMode === 'skin' ? 'quiz-mode-active' : ''}`}
              onClick={() => setQuizMode('skin')}
            >
              <span style={{ fontSize: '1.3rem' }}>✨</span>
              Skin Care
            </button>
            <button 
              className={`quiz-mode-btn ${quizMode === 'hair' ? 'quiz-mode-active' : ''}`}
              onClick={() => setQuizMode('hair')}
            >
              <span style={{ fontSize: '1.3rem' }}>💇</span>
              Hair Care
            </button>
          </div>

          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
            {quizMode === 'skin' 
              ? 'Haphrus — Personalized Skin Care Recommendations' 
              : 'Haphrus — Personalized Hair Care Recommendations'}
          </h1>
          
          {/* ===== SKIN QUIZ ===== */}
          {quizMode === 'skin' && (
            <>
              <QuestionSection title="What is your skin type?" style={{ marginBottom: '28px' }}>
                {['Oily', 'Dry', 'Combination', 'Normal'].map(type => (
                  <button 
                    key={type} 
                    className={`quiz-option ${skinType === type ? 'quiz-option-selected' : ''}`}
                    onClick={() => setSkinType(type)}
                  >
                    {type}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="Any specific concerns?" style={{ marginBottom: '28px' }}>
                {['Acne', 'Aging', 'Dark Spots', 'Redness', 'Texture', 'Large Pores'].map(concern => (
                  <button 
                    key={concern} 
                    className={`quiz-option ${concerns.includes(concern) ? 'quiz-option-selected' : ''}`}
                    onClick={() => handleConcernToggle(concern)}
                  >
                    {concern}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="How sensitive is your skin?" style={{ marginBottom: '28px' }}>
                {['Very Sensitive', 'Moderate', 'Not Sensitive'].map(level => (
                  <button 
                    key={level} 
                    className={`quiz-option ${sensitivity === level ? 'quiz-option-selected' : ''}`}
                    onClick={() => setSensitivity(level)}
                  >
                    {level}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="Your routine preference?" style={{ marginBottom: '36px' }}>
                {['Minimalist (2-3 steps)', 'Moderate (4-6 steps)', 'Maximum (7+ steps)'].map(pref => (
                  <button 
                    key={pref} 
                    className={`quiz-option ${routinePreference === pref ? 'quiz-option-selected' : ''}`}
                    onClick={() => setRoutinePreference(pref)}
                  >
                    {pref}
                  </button>
                ))}
              </QuestionSection>
            </>
          )}

          {/* ===== HAIR QUIZ ===== */}
          {quizMode === 'hair' && (
            <>
              <QuestionSection title="What is your hair type?" style={{ marginBottom: '28px' }}>
                {['Straight', 'Wavy', 'Curly', 'Coily'].map(type => (
                  <button 
                    key={type} 
                    className={`quiz-option ${hairType === type ? 'quiz-option-selected' : ''}`}
                    onClick={() => setHairType(type)}
                  >
                    {type}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="Any hair concerns?" style={{ marginBottom: '28px' }}>
                {['Hair Fall', 'Dandruff', 'Frizz', 'Dryness', 'Thinning', 'Split Ends', 'Oily Scalp', 'Color Damage'].map(concern => (
                  <button 
                    key={concern} 
                    className={`quiz-option ${hairConcerns.includes(concern) ? 'quiz-option-selected' : ''}`}
                    onClick={() => handleHairConcernToggle(concern)}
                  >
                    {concern}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="How is your scalp condition?" style={{ marginBottom: '28px' }}>
                {['Oily', 'Dry', 'Normal', 'Sensitive / Itchy'].map(condition => (
                  <button 
                    key={condition} 
                    className={`quiz-option ${scalpCondition === condition ? 'quiz-option-selected' : ''}`}
                    onClick={() => setScalpCondition(condition)}
                  >
                    {condition}
                  </button>
                ))}
              </QuestionSection>

              <QuestionSection title="Your hair care routine preference?" style={{ marginBottom: '36px' }}>
                {['Basic (Shampoo + Conditioner)', 'Moderate (3-4 products)', 'Complete (5+ products)'].map(pref => (
                  <button 
                    key={pref} 
                    className={`quiz-option ${hairRoutinePreference === pref ? 'quiz-option-selected' : ''}`}
                    onClick={() => setHairRoutinePreference(pref)}
                  >
                    {pref}
                  </button>
                ))}
              </QuestionSection>
            </>
          )}

          <button 
            onClick={handleSubmit} 
            className="btn-primary" 
            style={{ width: '100%', fontSize: '1.2rem', padding: '20px', borderRadius: '16px' }}
            disabled={loading}
          >
            {loading 
              ? 'Analyzing with AI...' 
              : quizMode === 'skin' 
                ? 'Get My Skin Care Routine' 
                : 'Get My Hair Care Routine'
            }
          </button>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#9e8e72', fontSize: '0.85rem' }}>
        <p>© {new Date().getFullYear()} Haphrus. Smart product recommendations powered by AI.</p>
      </footer>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
};

export default SkinQuiz;
