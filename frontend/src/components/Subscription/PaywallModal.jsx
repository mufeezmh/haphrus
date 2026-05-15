import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaywallModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1"/>
          </svg>
        </div>

        <h2 className="modal-title">Free Trial Used</h2>
        <p className="modal-subtitle">
          You've used your <strong>free recommendation</strong>. Upgrade to unlock unlimited AI-powered skincare analysis.
        </p>

        <div className="modal-features">
          <div className="modal-feature-item">
            <span className="feature-check">✓</span>
            <span>Unlimited AI Recommendations</span>
          </div>
          <div className="modal-feature-item">
            <span className="feature-check">✓</span>
            <span>Personalized Skin Analysis</span>
          </div>
          <div className="modal-feature-item">
            <span className="feature-check">✓</span>
            <span>Morning & Evening Routines</span>
          </div>
          <div className="modal-feature-item">
            <span className="feature-check">✓</span>
            <span>Expert Product Suggestions</span>
          </div>
        </div>

        <button 
          className="btn-primary modal-cta"
          onClick={() => navigate('/subscribe')}
        >
          View Plans — Starting at ₹199/mo
        </button>

        <p className="modal-note">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
};

export default PaywallModal;
