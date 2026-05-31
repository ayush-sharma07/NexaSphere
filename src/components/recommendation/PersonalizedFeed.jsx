// src/components/recommendation/PersonalizedFeed.jsx
import { useState, useEffect } from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { DynamicIcon } from '../../shared/Icons';

export default function PersonalizedFeed({ events, onEventClick }) {
  const {
    recommendations,
    userInterests,
    loading,
    trackEvent,
    getSimilarEvents
  } = useRecommendations(events);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarEventsList, setSimilarEventsList] = useState([]);

  const handleEventClick = (event) => {
    trackEvent(event.id, 'view', {
      category: event.category,
      tags: event.tags
    });
    setSelectedEvent(event);
    if (onEventClick) onEventClick(event);
  };

  const handleFindSimilar = (event) => {
    const similar = getSimilarEvents(event, 4);
    setSimilarEventsList(similar);
    setSelectedEvent(event);
    setShowSimilar(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid #CC1111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ color: '#9CA3AF', marginTop: '16px' }}>Analyzing your interests...</p>
      </div>
    );
  }

  return (
    <div>
      {/* User Interests Section */}
      {userInterests && userInterests.topCategories.length > 0 && (
        <div style={{ marginBottom: '32px', padding: '20px', background: '#1A1A1A', borderRadius: '16px' }}>
          <h3 style={{ color: '#FFFFFF', marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DynamicIcon name="TrendingUp" size={18} style={{ color: '#CC1111' }} />
            Your Interests
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {userInterests.topCategories.map(cat => (
              <span key={cat} style={{ padding: '4px 12px', background: '#CC1111', color: 'white', borderRadius: '20px', fontSize: '12px' }}>
                {cat}
              </span>
            ))}
            {userInterests.topTags.slice(0, 6).map(tag => (
              <span key={tag} style={{ padding: '4px 12px', background: '#2A2A2A', color: '#9CA3AF', borderRadius: '20px', fontSize: '12px' }}>
                {tag}
              </span>
            ))}
          </div>
          <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '12px' }}>
            Based on {userInterests.totalInteractions} interactions
          </p>
        </div>
      )}

      {/* Recommendations Section */}
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DynamicIcon name="Sparkles" size={20} style={{ color: '#CC1111' }} />
        Recommended for You
      </h2>
      
      {recommendations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--bdr)',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            marginBottom: '24px',
            color: '#a855f7'
          }}>
            <DynamicIcon name="Compass" size={36} />
          </div>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 600, marginBottom: '10px', fontFamily: "'Rajdhani', sans-serif" }}>
            No Recommendations Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 24px' }}>
            To generate personalized recommendations, click on and browse the events you are interested in from the main feed!
          </p>
          <button
            onClick={() => {
              // Locate the main feed timeline button or scroll back up to the page buttons
              const buttons = document.querySelectorAll('button');
              const timelineBtn = Array.from(buttons).find(b => b.textContent?.includes('Timeline'));
              if (timelineBtn) {
                timelineBtn.click();
              }
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, var(--c1), var(--c2))',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(168, 85, 247, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.25)';
            }}
          >
            Explore Events Timeline
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {recommendations.map(rec => (
            <div
              key={rec.id}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#CC1111';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A2A';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    onClick={() => handleEventClick(rec)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
                      {rec.name}
                    </h3>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>
                      {rec.description?.substring(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {rec.tags?.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', background: '#2A2A2A', borderRadius: '12px', color: '#9CA3AF' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFindSimilar(rec)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #3B82F6',
                      color: '#3B82F6',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3B82F6';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#3B82F6';
                    }}
                  >
                    <DynamicIcon name="Copy" size={12} />
                    Find Similar
                  </button>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: rec.recommendationScore?.score > 70 ? '#10B981' : rec.recommendationScore?.score > 40 ? '#F59E0B' : '#6B7280'
                  }}>
                    {rec.recommendationScore?.score}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Match Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Similar Events Modal */}
      {showSimilar && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowSimilar(false)}>
          <div style={{
            background: '#1A1A1A',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '90%',
            padding: '24px',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold' }}>
                Similar to "{selectedEvent.name}"
              </h3>
              <button onClick={() => setShowSimilar(false)} style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            
            {similarEventsList.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>No similar events found</p>
            ) : (
              similarEventsList.map(similar => (
                <div
                  key={similar.id}
                  style={{
                    padding: '16px',
                    background: '#2A2A2A',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    handleEventClick(similar);
                    setShowSimilar(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3A3A3A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                  }}
                >
                  <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{similar.name}</h4>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px' }}>{similar.description?.substring(0, 80)}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {similar.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', background: '#1A1A1A', borderRadius: '8px', color: '#6B7280' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            <button
              onClick={() => setShowSimilar(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#CC1111',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '16px',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}