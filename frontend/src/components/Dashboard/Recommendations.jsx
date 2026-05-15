import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { advice, quizMode } = location.state || {};

  const isHair = quizMode === 'hair';

  // Update document title for SEO
  useEffect(() => {
    document.title = isHair 
      ? 'Haphrus – Your Personalized Hair Care Recommendations' 
      : 'Haphrus – Your Personalized Skin Care Recommendations';
    return () => { document.title = 'Haphrus – Smart Product Recommendation Platform'; };
  }, [isHair]);

  if (!advice) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <h2>No recommendations found.</h2>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Take the Quiz</button>
        </div>
      </div>
    );
  }

  // Determine routine keys based on quiz mode
  const routineKeys = isHair 
    ? { first: 'washDay', second: 'maintenance', firstLabel: '🧴 Wash Day Routine', secondLabel: '✨ Maintenance Days' }
    : { first: 'morning', second: 'evening', firstLabel: '☀️ Morning Routine', secondLabel: '🌙 Evening Routine' };

  const firstRoutine = advice.routine?.[routineKeys.first] || [];
  const secondRoutine = advice.routine?.[routineKeys.second] || [];

  return (
    <main className="container" style={{ paddingTop: '50px', paddingBottom: '100px' }}>
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Analysis Section */}
        <section className="glass-card" style={{ padding: '40px', marginBottom: '30px' }} aria-label="Haphrus analysis">
          <h1 style={{ color: 'var(--primary)', marginBottom: '20px' }}>
            {isHair ? 'Expert Hair Analysis' : 'Expert Skin Analysis'}
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>{advice.analysis}</p>
        </section>

        {/* Products Section */}
        <h2 style={{ marginBottom: '20px', marginLeft: '10px' }}>
          {isHair ? 'Recommended Hair Products' : 'Recommended Skin Products'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {advice.products.map((product, index) => (
            <div key={index} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <img 
                src={product.imageUrl} 
                alt={`Haphrus recommends ${product.name} by ${product.brand}`} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = isHair
                    ? "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400"
                    : "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400";
                }}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} 
              />
              <h3 style={{ marginBottom: '5px' }}>{product.name}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '10px' }}>{product.brand}</p>
              <p style={{ fontSize: '0.9rem', flexGrow: 1, marginBottom: '20px' }}>{product.reason}</p>
              <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary" 
                style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem' }}
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>

        {/* Routine Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          {firstRoutine.length > 0 && (
            <div className="glass-card" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>{routineKeys.firstLabel}</h3>
              <ul style={{ listStyleType: 'none' }}>
                {firstRoutine.map((step, i) => (
                  <li key={i} style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--primary)' }}>✓</span> {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {secondRoutine.length > 0 && (
            <div className="glass-card" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>{routineKeys.secondLabel}</h3>
              <ul style={{ listStyleType: 'none' }}>
                {secondRoutine.map((step, i) => (
                  <li key={i} style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--primary)' }}>✓</span> {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tips Section */}
        {advice.tips && advice.tips.length > 0 && (
          <div className="glass-card" style={{ padding: '40px', marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Pro Tips</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {advice.tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: '10px' }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #c9a84c, #d4b868)' }}>
            Retake Quiz
          </button>
        </div>
      </div>
    </main>
  );
};

export default Recommendations;
