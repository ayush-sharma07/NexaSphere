import { useState, useEffect } from 'react';
import { DynamicIcon } from '../../shared/Icons';

const RecommendationWidget = ({ events, onEventClick }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    
    const clickedEventIds = new Set(interactions.map(i => i.eventId));
    const clickedCategories = new Set();
    
    events.forEach(event => {
      if (clickedEventIds.has(event.id) && event.category) {
        clickedCategories.add(event.category);
      }
    });
    
    const recommended = events
      .filter(event => !clickedEventIds.has(event.id))
      .map(event => ({
        ...event,
        score: clickedCategories.has(event.category) ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 45
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    
    setRecommendations(recommended);
    setLoading(false);
  }, [events]);

  const handleEventClick = (event) => {
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    interactions.push({ eventId: event.id, timestamp: Date.now() });
    localStorage.setItem('userInteractions', JSON.stringify(interactions.slice(-50)));
    onEventClick(event);
  };

  if (loading) {
    return (
      <div style={{ margin: '2rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: '200px', background: 'var(--bg2)', borderRadius: '16px' }} className="shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div style={{ margin: '2rem 0 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>✨</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Recommended For You</h2>
        </div>
        <p style={{ color: 'var(--t2)', fontSize: '0.9rem', margin: 0 }}>Based on your interests and activity</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        {recommendations.map((event, idx) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            style={{
              background: 'var(--card)',
              borderRadius: '20px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--bdr)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              height: 'auto',
              minHeight: '220px',
              animation: `fadeInUp 0.4s ease ${idx * 0.05}s both`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--bdr)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px', 
              background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'white',
              fontFamily: "'Rajdhani', sans-serif"
            }}>
              {event.score}% match
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingRight: '60px' }}>
              <span style={{ color: 'var(--c1)', display: 'flex' }}>
                <DynamicIcon name={event.icon || 'Calendar'} size={28} />
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{event.name}</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.75rem', color: 'var(--t2)' }}>
              <DynamicIcon name="Calendar" size={12} /> 
              <span>{event.date}</span>
            </div>
            
            <p style={{ 
              fontSize: '0.8rem', 
              color: 'var(--t2)', 
              margin: '8px 0 16px', 
              lineHeight: 1.5,
              flex: 1
            }}>
              {event.description?.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}
            </p>
            
            <div style={{ 
              marginTop: 'auto', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--bdr)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'var(--c1)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600
              }}>
                View Details <span>→</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => window.location.href = '/events'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 32px',
            background: 'transparent',
            border: '2px solid var(--c1)',
            borderRadius: '100px',
            color: 'var(--c1)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            fontFamily: "'Rajdhani', sans-serif"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--c1)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--c1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          View All Events →
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shimmer {
          background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .recommendation-widget {
            margin: 1rem 0 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationWidget;