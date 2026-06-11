import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

export default function EventCalendarView({ events, onEventClick }) {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState({});

  useEffect(() => {
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.name,
      start: event.startDate || event.date,
      end: event.endDate,
      extendedProps: {
        description: event.description,
        location: event.location,
        tags: event.tags,
        status: event.status,
        category: event.category
      },
      backgroundColor: getCategoryColor(event.category),
      borderColor: getCategoryColor(event.category),
      textColor: '#FFFFFF',
      className: 'custom-event'
    }));
    setCalendarEvents(formattedEvents);
  }, [events]);

  const getCategoryColor = (category) => {
    const colors = {
      workshop: '#3B82F6',
      hackathon: '#EF4444',
      debate: '#F59E0B',
      opensource: '#10B981',
      tech: '#8B5CF6',
      'non-tech': '#EC4899',
      default: '#CC1111'
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowModal(true);
    if (onEventClick) onEventClick(info.event.extendedProps);
  };

  const handleRSVP = (eventId) => {
    if (rsvpStatus[eventId]) {
      alert('You have already RSVP\'d for this event');
      return;
    }
    setRsvpStatus(prev => ({ ...prev, [eventId]: true }));
    alert('Successfully RSVP\'d for this event');
    setShowModal(false);
  };

  const addToGoogleCalendar = (event) => {
    const start = event.start?.toISOString().replace(/-|:|\.\d+/g, '');
    const end = event.end?.toISOString().replace(/-|:|\.\d+/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.extendedProps?.description || '')}&location=${encodeURIComponent(event.extendedProps?.location || '')}`;
    window.open(url, '_blank');
  };

  const downloadICS = (event) => {
    const start = event.start?.toISOString();
    const end = event.end?.toISOString();
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${start?.replace(/-|:|\.\d+/g, '')}
DTEND:${end?.replace(/-|:|\.\d+/g, '')}
DESCRIPTION:${event.extendedProps?.description || ''}
LOCATION:${event.extendedProps?.location || ''}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="calendar-view-container" style={{ marginTop: '40px' }}>
      <style>{`
        /* Calendar Container */
        .fc {
          background: var(--card);
          border-radius: 24px;
          padding: 28px;
          border: 1px solid var(--bdr);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        /* Toolbar */
        .fc .fc-toolbar-title {
          color: var(--t1);
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        /* Buttons */
        .fc .fc-button-primary {
          background: transparent;
          border: 1px solid var(--bdr);
          color: var(--t2);
          text-transform: capitalize;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 100px;
          transition: all 0.2s ease;
          font-size: 0.85rem;
        }
        
        .fc .fc-button-primary:hover {
          background: var(--c1);
          border-color: var(--c1);
          color: white;
          transform: translateY(-1px);
        }
        
        .fc .fc-button-primary:focus {
          box-shadow: none;
        }
        
        .fc .fc-button-primary.fc-button-active {
          background: var(--c1);
          border-color: var(--c1);
          color: white;
        }
        
        /* Header Cells */
        .fc th {
          color: var(--t2);
          padding: 16px 0;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-color: var(--bdr);
          background: rgba(0,0,0,0.02);
        }
        
        /* Day Cells */
        .fc td {
          border-color: var(--bdr);
        }
        
        .fc .fc-daygrid-day {
          transition: background 0.2s ease;
        }
        
        .fc .fc-daygrid-day:hover {
          background: rgba(204,17,17,0.03);
        }
        
        /* Day Numbers */
        .fc .fc-daygrid-day-number {
          color: var(--t2);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 10px;
        }
        
        /* Today Highlight */
        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(204,17,17,0.05);
          position: relative;
        }
        
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: var(--c1);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        /* Events */
        .fc .fc-daygrid-event {
          cursor: pointer;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          margin: 2px 4px;
        }
        
        .fc .fc-daygrid-event:hover {
          transform: translateY(-2px);
          filter: brightness(0.95);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        /* More Events Link */
        .fc .fc-daygrid-more-link {
          color: var(--c1);
          font-size: 0.7rem;
          font-weight: 500;
          text-decoration: none;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(204,17,17,0.1);
        }
        
        .fc .fc-daygrid-more-link:hover {
          background: var(--c1);
          color: white;
        }
        
        /* Week/Day View */
        .fc .fc-timegrid-slot-label {
          color: var(--t2);
          font-size: 0.75rem;
        }
        
        .fc .fc-timegrid-event {
          border-radius: 8px;
          padding: 6px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 16px;
          }
          .fc {
            padding: 16px;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
          .fc .fc-button-primary {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
          .fc th {
            padding: 10px 0;
            font-size: 0.7rem;
          }
          .fc .fc-daygrid-day-number {
            font-size: 0.75rem;
            padding: 6px;
          }
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
        locale="en"
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
        dayMaxEvents={3}
        displayEventTime={true}
        eventDisplay="block"
      />

      {/* Event Modal - Matching NexaSphere Timeline Card Design */}
      {showModal && selectedEvent && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowModal(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: 'var(--card)',
              border: '1px solid var(--bdr)',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(204,17,17,0.08), rgba(0,0,0,0))',
              borderBottom: '1px solid var(--bdr)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--t1)',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  {selectedEvent.title}
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span className={`timeline-badge ${selectedEvent.extendedProps?.status === 'completed' ? 'completed' : 'upcoming'}`} style={{
                    fontSize: '0.7rem',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: selectedEvent.extendedProps?.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(204,17,17,0.1)',
                    color: selectedEvent.extendedProps?.status === 'completed' ? '#10B981' : 'var(--c1)',
                    border: `1px solid ${selectedEvent.extendedProps?.status === 'completed' ? 'rgba(16,185,129,0.3)' : 'rgba(204,17,17,0.3)'}`,
                    fontWeight: 500
                  }}>
                    {selectedEvent.extendedProps?.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                  {selectedEvent.extendedProps?.tags?.slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.7rem',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'var(--c2a)',
                      color: 'var(--c2)',
                      border: '1px solid var(--c2b)',
                      fontWeight: 500
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--t2)',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(204,17,17,0.1)';
                  e.currentTarget.style.color = 'var(--c1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--t2)';
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--bdr)',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  📅 {selectedEvent.start?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {selectedEvent.start?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) && (
                    <> at {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </span>
              </div>

              {selectedEvent.extendedProps?.location && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '20px',
                  color: 'var(--t2)',
                  fontSize: '0.9rem'
                }}>
                  <span>📍</span>
                  <span>{selectedEvent.extendedProps.location}</span>
                </div>
              )}

              {selectedEvent.extendedProps?.description && (
                <p style={{ 
                  color: 'var(--t2)', 
                  marginBottom: '0', 
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {selectedEvent.extendedProps.description}
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 28px',
              borderTop: '1px solid var(--bdr)',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              background: 'rgba(0,0,0,0.02)'
            }}>
              <button 
                onClick={() => handleRSVP(selectedEvent.id)}
                disabled={rsvpStatus[selectedEvent.id]}
                style={{
                  flex: 1,
                  background: rsvpStatus[selectedEvent.id] ? 'var(--bdr)' : 'var(--c1)',
                  border: 'none',
                  color: rsvpStatus[selectedEvent.id] ? 'var(--t2)' : 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: rsvpStatus[selectedEvent.id] ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {rsvpStatus[selectedEvent.id] ? '✓ RSVP Confirmed' : 'RSVP Now'}
              </button>
              <button 
                onClick={() => addToGoogleCalendar(selectedEvent)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--c1)',
                  color: 'var(--c1)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--c1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--c1)';
                }}
              >
                Google Calendar
              </button>
              <button 
                onClick={() => downloadICS(selectedEvent)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--bdr)',
                  color: 'var(--t2)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c1)';
                  e.currentTarget.style.color = 'var(--c1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bdr)';
                  e.currentTarget.style.color = 'var(--t2)';
                }}
              >
                Export (.ics)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}