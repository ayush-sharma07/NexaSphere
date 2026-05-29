// src/services/scheduling/schedulingEngine.js

export const CONFLICT_TYPES = {
  VENUE: 'venue',
  SPEAKER: 'speaker',
  TIME: 'time',
  EQUIPMENT: 'equipment'
};

class SchedulingEngine {
  constructor() {
    this.events = [];
    this.venues = [];
    this.speakers = [];
  }

  loadEvents(events) {
    this.events = events;
  }

  // Detect conflicts for a proposed event
  detectConflicts(event) {
    const conflicts = [];

    for (const existingEvent of this.events) {
      // Time conflict
      if (this.isTimeOverlap(event, existingEvent)) {
        conflicts.push({
          type: CONFLICT_TYPES.TIME,
          severity: 'high',
          description: `Time conflict with "${existingEvent.name || existingEvent.title}"`,
          suggestedAction: `Reschedule to different time slot`
        });
      }

      // Venue conflict
      if (event.venue && existingEvent.venue === event.venue && this.isTimeOverlap(event, existingEvent)) {
        conflicts.push({
          type: CONFLICT_TYPES.VENUE,
          severity: 'high',
          description: `Venue already booked for "${existingEvent.name || existingEvent.title}"`,
          suggestedAction: `Choose alternative venue`
        });
      }

      // Speaker conflict
      if (event.speaker && existingEvent.speaker === event.speaker && this.isTimeOverlap(event, existingEvent)) {
        conflicts.push({
          type: CONFLICT_TYPES.SPEAKER,
          severity: 'medium',
          description: `Speaker already scheduled for "${existingEvent.name || existingEvent.title}"`,
          suggestedAction: `Consider alternative speaker or time`
        });
      }
    }

    return conflicts;
  }

  isTimeOverlap(event1, event2) {
    const start1 = new Date(event1.startDate);
    const end1 = new Date(event1.endDate);
    const start2 = new Date(event2.startDate);
    const end2 = new Date(event2.endDate);

    return (start1 < end2 && start2 < end1);
  }

  getOptimalTimeSlots() {
    return {
      bestDays: ['Thursday', 'Wednesday', 'Tuesday'],
      bestTimeRanges: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM', '2:00 PM - 4:00 PM'],
      leastPopular: ['Sunday Morning', 'Monday Morning']
    };
  }

  predictAttendance(event) {
    const date = new Date(event.startDate);
    const hour = date.getHours();
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    let score = 60; // base attendance
    
    // Evening events have better attendance
    if (hour >= 16 && hour <= 20) score += 20;
    if (hour >= 9 && hour <= 12) score += 10;
    
    // Weekday vs Weekend
    if (day === 'Saturday' || day === 'Sunday') score -= 15;
    if (day === 'Thursday' || day === 'Wednesday') score += 10;
    
    return Math.min(95, Math.max(25, score));
  }
}

export const schedulingEngine = new SchedulingEngine();