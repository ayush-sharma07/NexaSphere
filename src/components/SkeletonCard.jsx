import React from 'react';
import SkeletonText from './SkeletonText';

/**
 * Reusable SkeletonCard Component
 * Supports multiple card shapes: 'event', 'team', 'activity', 'stat', 'timeline-row', 'achievement'
 */
export default function SkeletonCard({ type = 'event', style = {}, idx = 0 }) {
  // 1. Event Skeleton Card (timeline-card layout)
  if (type === 'event') {
    return (
      <div 
        className="timeline-card ns-skeleton-card"
        style={{
          opacity: 1,
          pointerEvents: 'none',
          border: '1px solid var(--bdr)',
          ...style
        }}
      >
        {/* Header: Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div className="ns-skeleton" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
          <div className="ns-skeleton" style={{ width: '140px', height: '20px', borderRadius: '4px' }} />
        </div>
        
        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div className="ns-skeleton" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
          <div className="ns-skeleton" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
        </div>
        
        {/* Description */}
        <SkeletonText lines={2} width={['100%', '85%']} style={{ marginBottom: '16px' }} />
        
        {/* Badges / Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="ns-skeleton" style={{ width: '70px', height: '22px', borderRadius: '10px' }} />
          <div className="ns-skeleton" style={{ width: '50px', height: '22px', borderRadius: '10px' }} />
          <div className="ns-skeleton" style={{ width: '60px', height: '22px', borderRadius: '10px' }} />
        </div>
      </div>
    );
  }

  // 2. Team Skeleton Card
  if (type === 'team') {
    return (
      <div 
        className="team-card ns-skeleton-card"
        style={{
          opacity: 1,
          pointerEvents: 'none',
          border: '1px solid var(--bdr)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...style
        }}
      >
        <div className="team-card-photo-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="ns-skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
        </div>
        <div className="ns-skeleton" style={{ width: '120px', height: '18px', borderRadius: '4px', marginTop: '16px', marginBottom: '8px' }} />
        <div className="ns-skeleton" style={{ width: '70px', height: '14px', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="team-card-chips" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <div className="ns-skeleton" style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
          <div className="ns-skeleton" style={{ width: '40px', height: '18px', borderRadius: '4px' }} />
        </div>
        <div className="corner-tl" /><div className="corner-br" />
      </div>
    );
  }

  // 3. Activity Skeleton Card
  if (type === 'activity') {
    return (
      <div 
        className="activity-card ns-skeleton-card"
        style={{
          opacity: 1,
          pointerEvents: 'none',
          border: '1px solid var(--bdr)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '420px',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
      >
        <div className="card-accent-line" style={{ background: 'var(--c1)', opacity: 0.15 }}/>
        <div className="ns-skeleton" style={{ width: '34px', height: '34px', borderRadius: '8px', marginBottom: '12px' }} />
        <div className="ns-skeleton" style={{ width: '120px', height: '20px', borderRadius: '4px', marginBottom: '12px' }} />
        <SkeletonText lines={3} width={['100%', '95%', '80%']} style={{ marginBottom: '20px', flexGrow: 1 }} />
        
        {/* Chips */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <div className="ns-skeleton" style={{ width: '60px', height: '18px', borderRadius: '12px' }} />
          <div className="ns-skeleton" style={{ width: '70px', height: '18px', borderRadius: '12px' }} />
          <div className="ns-skeleton" style={{ width: '50px', height: '18px', borderRadius: '12px' }} />
        </div>
        
        {/* Bullet points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div className="ns-skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
            <div className="ns-skeleton" style={{ width: '120px', height: '12px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div className="ns-skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
            <div className="ns-skeleton" style={{ width: '140px', height: '12px', borderRadius: '4px' }} />
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div className="ns-skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          <div className="ns-skeleton" style={{ width: '12px', height: '14px', borderRadius: '4px' }} />
        </div>
        
        <div className="corner-tl" /><div className="corner-br" />
      </div>
    );
  }

  // 4. Dashboard Stat Skeleton
  if (type === 'stat') {
    return (
      <div 
        className="ns-skeleton-card"
        style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '12px',
          padding: '24px',
          pointerEvents: 'none',
          ...style
        }}
      >
        <div className="ns-skeleton" style={{ width: '80px', height: '13px', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="ns-skeleton" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
      </div>
    );
  }

  // 5. Dashboard Timeline Row Skeleton
  if (type === 'timeline-row') {
    return (
      <div 
        className="ns-skeleton-card"
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #2A2A2A',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
          ...style
        }}
      >
        <div className="ns-skeleton" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
        <div className="ns-skeleton" style={{ width: '80%', height: '12px', borderRadius: '4px' }} />
        <div className="ns-skeleton" style={{ width: '60px', height: '10px', borderRadius: '4px' }} />
      </div>
    );
  }

  // 6. Dashboard Achievement Badge Skeleton
  if (type === 'achievement') {
    return (
      <div 
        className="ns-skeleton-card"
        style={{
          textAlign: 'center',
          padding: '16px',
          background: '#222222',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          ...style
        }}
      >
        <div className="ns-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        <div className="ns-skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
        <div className="ns-skeleton" style={{ width: '110px', height: '10px', borderRadius: '4px' }} />
        <div className="ns-skeleton" style={{ width: '40px', height: '11px', borderRadius: '4px', marginTop: '4px' }} />
      </div>
    );
  }

  return null;
}
