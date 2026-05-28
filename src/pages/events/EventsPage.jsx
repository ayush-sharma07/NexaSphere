import React, { useState } from 'react';
import DynamicIcon from '../../components/common/DynamicIcon';
import SchedulingAssistant from '../../components/events/SchedulingAssistant';
import PersonalizedFeed from '../../components/events/PersonalizedFeed';

const EventsPage = ({ events = [], onEventClick }) => {
  const [scheduleView, setScheduleView] = useState(false);
  const [recommendationView, setRecommendationView] = useState(false);
  const [view, setView] = useState('timeline');
  
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="container">
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Discover and manage your upcoming events</p>
        </div>
      </div>

      <div className="events-controls">
        <div className="container">
          <div className="view-buttons">
            <button
              onClick={() => {
                setScheduleView(false);
                setRecommendationView(false);
                setView('timeline');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                background: !scheduleView && !recommendationView && view === 'timeline' ? 'var(--c1)' : 'transparent',
                border: !scheduleView && !recommendationView && view === 'timeline' ? 'none' : '1px solid var(--bdr)',
                borderRadius: '100px',
                color: !scheduleView && !recommendationView && view === 'timeline' ? 'white' : 'var(--t2)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              <DynamicIcon name="Calendar" size={16} />
              Timeline
            </button>

            <button
              onClick={() => {
                setScheduleView(false);
                setRecommendationView(true);
                setView('timeline');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                background: recommendationView ? 'var(--c1)' : 'transparent',
                border: recommendationView ? 'none' : '1px solid var(--bdr)',
                borderRadius: '100px',
                color: recommendationView ? 'white' : 'var(--t2)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              <DynamicIcon name="Sparkles" size={16} />
              For You
            </button>

            <button
              onClick={() => {
                setScheduleView(true);
                setView('timeline');
                setRecommendationView(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                background: scheduleView ? 'var(--c1)' : 'transparent',
                border: scheduleView ? 'none' : '1px solid var(--bdr)',
                borderRadius: '100px',
                color: scheduleView ? 'white' : 'var(--t2)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              <DynamicIcon name="Zap" size={16} />
              Smart Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {scheduleView ? (
          <SchedulingAssistant events={events} onEventClick={onEventClick} />
        ) : recommendationView ? (
          <PersonalizedFeed events={sortedEvents} onEventClick={onEventClick} />
        ) : view === 'timeline' ? (
          <div className="events-timeline ns-reveal">
            {sortedEvents.map((ev, i) => {
              const hasDetailPage = !!ev.hasDetailPage;
              return (
                <div className="timeline-item" key={ev.id}>
                  <div className={`timeline-dot${ev.status === 'upcoming' ? ' upcoming' : ''}`} />
                  <div
                    className={`timeline-card shimmer ${i % 2 === 0 ? 'pop-left' : 'pop-right'} fired`}
                    style={{
                      animationDelay: `${i * .11}s`,
                      cursor: hasDetailPage ? 'pointer' : 'default',
                      transition: 'all .28s ease',
                    }}
                    onClick={() => hasDetailPage && onEventClick?.(ev)}
                  >
                    <div className="timeline-card-content">
                      <div className="timeline-date">
                        <span className="timeline-day">
                          {new Date(ev.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                        <span className="timeline-month">
                          {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="timeline-details">
                        <h3 className="timeline-title">{ev.title}</h3>
                        <div className="timeline-meta">
                          <span className="timeline-time">
                            <DynamicIcon name="Clock" size={14} />
                            {ev.time || 'Time TBD'}
                          </span>
                          <span className="timeline-location">
                            <DynamicIcon name="MapPin" size={14} />
                            {ev.location || 'Location TBD'}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="timeline-description">{ev.description}</p>
                        )}
                      </div>
                      {ev.status === 'upcoming' && (
                        <div className="timeline-badge">
                          <span className="badge">Upcoming</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EventsPage;