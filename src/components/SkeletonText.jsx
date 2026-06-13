import React from 'react';

/**
 * Reusable SkeletonText Component
 * Creates text lines with custom styling for heading and paragraph placeholders.
 */
export default function SkeletonText({ lines = 1, width = '100%', height = '14px', className = '', style = {} }) {
  // If width is an array, map each line to its corresponding width in the array.
  // Otherwise, if lines > 1, make the last line slightly shorter for a realistic paragraph look.
  const lineArray = Array.isArray(width) 
    ? width 
    : Array.from({ length: lines }, (_, i) => i === lines - 1 && lines > 1 ? '75%' : width);

  return (
    <div 
      className={`skeleton-text-container ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        width: '100%', 
        ...style 
      }}
    >
      {lineArray.map((w, idx) => (
        <div 
          key={idx}
          className="ns-skeleton" 
          style={{ 
            width: w, 
            height,
            borderRadius: '4px'
          }} 
        />
      ))}
    </div>
  );
}
