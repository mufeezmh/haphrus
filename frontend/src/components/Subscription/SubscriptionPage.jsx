import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../config/api';

const SubscriptionPage = () => {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isActive, setIsActive] = useState(false);
  const [showPayment, setShowPayment] = useState(null); // which plan payment form is shown
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [plansRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE}/api/subscription/plans`),
        token 
          ? axios.get(`${API_BASE}/api/subscription/status`, { headers })
          : Promise.resolve({ data: { subscription: { plan: 'free', isActive: false } } }),
      ]);

      setPlans(plansRes.data.plans);
      setCurrentPlan(statusRes.data.subscription?.plan || 'free');
      setIsActive(statusRes.data.subscription?.isActive || false);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowPayment(planId);
    setPaymentData({ cardNumber: '', expiry: '', cvv: '', name: '' });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setActivating(showPayment);
    try {
      const res = await axios.post(
        `${API_BASE}/api/subscription/activate`,
        { planId: showPayment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local storage user data
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.subscription = res.data.subscription;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setPaymentSuccess(true);
      setIsActive(true);
      setCurrentPlan(showPayment);
      
      // Show success then redirect
      setTimeout(() => {
        setShowPayment(null);
        setPaymentSuccess(false);
      }, 2000);
    } catch (err) {
      alert('Subscription failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActivating(null);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: '#7a7060' }}>Loading plans...</p>
        </div>
      </div>
    );
  }

  // If user has active subscription
  if (isActive && currentPlan !== 'free') {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="glass-card animate-fade-in" style={{ padding: '60px', maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ marginBottom: '15px', color: 'var(--primary)' }}>You're All Set!</h2>
          <p style={{ fontSize: '1.1rem', color: '#7a7060', marginBottom: '10px' }}>
            Your <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong> subscription is active.
          </p>
          <p style={{ color: '#a89f8f', marginBottom: '30px' }}>Enjoy unlimited AI-powered recommendations.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Get Recommendations →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ paddingTop: '50px', paddingBottom: '80px' }}>
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <p className="pricing-badge">PRICING</p>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '15px' }}>
              Unlock Your Best Skin
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#7a7060', maxWidth: '500px', margin: '0 auto' }}>
              Get unlimited AI-powered skincare recommendations tailored to your unique skin profile.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="pricing-grid">
            
            {/* Free Plan */}
            <div className="pricing-card glass-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Free</h3>
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-price">0</span>
                </div>
                <p className="pricing-period">one-time use</p>
              </div>
              <ul className="pricing-features">
                <li><span className="feature-check">✓</span> 1 AI Recommendation</li>
                <li><span className="feature-check">✓</span> Basic Skin Analysis</li>
                <li><span className="feature-check">✓</span> Product Suggestions</li>
                <li className="feature-disabled"><span className="feature-x">✗</span> Unlimited Access</li>
                <li className="feature-disabled"><span className="feature-x">✗</span> Priority Analysis</li>
              </ul>
              <button className="btn-outline" disabled>
                Current Plan
              </button>
            </div>

            {/* Monthly Plan */}
            <div className="pricing-card glass-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Monthly</h3>
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-price">{plans?.monthly?.price || 199}</span>
                </div>
                <p className="pricing-period">per month</p>
              </div>
              <ul className="pricing-features">
                {(plans?.monthly?.features || []).map((f, i) => (
                  <li key={i}><span className="feature-check">✓</span> {f}</li>
                ))}
              </ul>
              <button 
                className="btn-primary pricing-cta"
                onClick={() => handleSelectPlan('monthly')}
              >
                Subscribe Monthly
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="pricing-card pricing-card-popular glass-card">
              <div className="popular-badge">BEST VALUE</div>
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Yearly</h3>
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-price">{plans?.yearly?.price || 1499}</span>
                </div>
                <p className="pricing-period">per year</p>
                <p className="pricing-savings">Save 37% vs monthly</p>
              </div>
              <ul className="pricing-features">
                {(plans?.yearly?.features || []).map((f, i) => (
                  <li key={i}><span className="feature-check">✓</span> {f}</li>
                ))}
              </ul>
              <button 
                className="btn-primary pricing-cta"
                onClick={() => handleSelectPlan('yearly')}
                style={{ background: 'linear-gradient(135deg, #b85a82 0%, #e8a0be 100%)' }}
              >
                Subscribe Yearly
              </button>
            </div>
          </div>

          {/* Trust Section */}
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p style={{ color: '#a89f8f', fontSize: '0.9rem' }}>
              🔒 Secure payment · Cancel anytime · Instant activation
            </p>
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                background: 'none', border: 'none', color: 'var(--primary)', 
                cursor: 'pointer', fontSize: '1rem', textDecoration: 'underline' 
              }}
            >
              ← Back to Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => { if (!activating) { setShowPayment(null); setPaymentSuccess(false); } }}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            {!activating && !paymentSuccess && (
              <button className="modal-close" onClick={() => setShowPayment(null)}>&times;</button>
            )}

            {paymentSuccess ? (
              /* Success State */
              <div style={{ padding: '20px 0' }}>
                <div className="payment-success-icon">✓</div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Payment Successful!</h2>
                <p style={{ color: '#7a7060' }}>
                  Your <strong style={{ textTransform: 'capitalize' }}>{showPayment}</strong> plan is now active.
                </p>
                <p style={{ color: '#a89f8f', fontSize: '0.9rem', marginTop: '10px' }}>Redirecting...</p>
              </div>
            ) : (
              /* Payment Form */
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="modal-title" style={{ marginBottom: '8px' }}>Complete Payment</h2>
                  <div className="payment-plan-summary">
                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      {showPayment} Plan
                    </span>
                    <span className="payment-amount">
                      ₹{plans?.[showPayment]?.price || '—'}
                      <small>/{showPayment === 'monthly' ? 'mo' : 'yr'}</small>
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="payment-form">
                  <div className="payment-field">
                    <label className="payment-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
                      value={paymentData.name}
                      onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="payment-field">
                    <label className="payment-label">Card Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="4242 4242 4242 4242"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="payment-field">
                      <label className="payment-label">Expiry</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="MM/YY"
                        value={paymentData.expiry}
                        onChange={(e) => setPaymentData({ ...paymentData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="payment-field">
                      <label className="payment-label">CVV</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary modal-cta"
                    disabled={activating}
                    style={{ marginTop: '8px' }}
                  >
                    {activating ? (
                      <span className="payment-processing">
                        <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}></span>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ₹${plans?.[showPayment]?.price || '—'}`
                    )}
                  </button>

                  <div className="payment-secure-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Secured with 256-bit SSL encryption</span>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionPage;
