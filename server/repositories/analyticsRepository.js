/**
 * Analytics Repository
 * Handles data access for analytics and real-time metrics
 */

import { withDb } from './db.js';

export const analyticsRepository = {
  /**
   * Get event registration metrics
   */
  async getEventMetrics(eventId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text as date,
           COALESCE(COUNT(DISTINCT r.id), 0) as totalRegistrations,
           COALESCE(SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END), 0) as checkedIn,
           COALESCE(SUM(CASE WHEN r.status = 'registered' THEN 1 ELSE 0 END), 0) as pendingCheckIn,
           e.max_attendees as maxAttendees,
           e.created_at as eventCreatedAt,
           e.updated_at as eventUpdatedAt
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         WHERE e.id = $1
         GROUP BY e.id, e.name, e.date_text, e.max_attendees, e.created_at, e.updated_at`,
        [eventId]
      );
      
      if (!rows.length) return null;
      
      const row = rows[0];
      return {
        eventId: row.id,
        eventName: row.name,
        eventDate: row.date,
        totalRegistrations: parseInt(row.totalRegistrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
        pendingCheckIn: parseInt(row.pendingCheckIn, 10),
        maxAttendees: row.maxAttendees,
        availableSeats: Math.max(0, (row.maxAttendees || 999) - parseInt(row.totalRegistrations, 10)),
        occupancyRate: row.maxAttendees ? (parseInt(row.totalRegistrations, 10) / row.maxAttendees * 100).toFixed(2) : 0,
        eventCreatedAt: row.eventCreatedAt,
        eventUpdatedAt: row.eventUpdatedAt,
      };
    });
  },

  /**
   * Get all events metrics for dashboard
   */
  async getAllEventsMetrics() {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text as date,
           e.status,
           COALESCE(COUNT(DISTINCT r.id), 0) as totalRegistrations,
           COALESCE(SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END), 0) as checkedIn,
           e.max_attendees as maxAttendees
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         GROUP BY e.id, e.name, e.date_text, e.status, e.max_attendees
         ORDER BY e.created_at DESC`
      );

      return rows.map(row => ({
        eventId: row.id,
        eventName: row.name,
        eventDate: row.date,
        eventStatus: row.status,
        totalRegistrations: parseInt(row.totalRegistrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
        maxAttendees: row.maxAttendees,
        occupancyRate: row.maxAttendees ? (parseInt(row.totalRegistrations, 10) / row.maxAttendees * 100).toFixed(2) : 0,
      }));
    });
  },

  /**
   * Get registration trends over time for an event
   */
  async getRegistrationTrends(eventId, timeWindow = '7 days') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           DATE(r.created_at) as date,
           COUNT(*) as registrations,
           SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn
         FROM registrations r
         WHERE r.event_id = $1 
           AND r.created_at > NOW() - INTERVAL $2
         GROUP BY DATE(r.created_at)
         ORDER BY date ASC`,
        [eventId, timeWindow]
      );

      return rows.map(row => ({
        date: row.date,
        registrations: parseInt(row.registrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
      }));
    });
  },

  /**
   * Get hourly registration trends
   */
  async getHourlyRegistrationTrends(eventId, hours = 24) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           DATE_TRUNC('hour', r.created_at) as hour,
           COUNT(*) as registrations,
           SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn
         FROM registrations r
         WHERE r.event_id = $1 
           AND r.created_at > NOW() - INTERVAL '1 hour' * $2
         GROUP BY DATE_TRUNC('hour', r.created_at)
         ORDER BY hour ASC`,
        [eventId, hours]
      );

      return rows.map(row => ({
        hour: row.hour,
        registrations: parseInt(row.registrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
      }));
    });
  },

  /**
   * Record a registration event
   */
  async recordRegistration(eventId, userId, email, status = 'registered') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO registrations (id, event_id, user_id, email, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         ON CONFLICT (event_id, email) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING *`,
        [eventId, userId, email, status]
      );

      return {
        id: rows[0].id,
        eventId: rows[0].event_id,
        userId: rows[0].user_id,
        email: rows[0].email,
        status: rows[0].status,
        createdAt: rows[0].created_at,
      };
    });
  },

  /**
   * Update registration status (e.g., check-in)
   */
  async updateRegistrationStatus(registrationId, status) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, registrationId]
      );

      if (!rows.length) return null;
      
      return {
        id: rows[0].id,
        eventId: rows[0].event_id,
        email: rows[0].email,
        status: rows[0].status,
        updatedAt: rows[0].updated_at,
      };
    });
  },

  /**
   * Get recent registrations for an event
   */
  async getRecentRegistrations(eventId, limit = 20) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT id, email, status, created_at
         FROM registrations
         WHERE event_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [eventId, limit]
      );

      return rows.map(row => ({
        id: row.id,
        email: row.email,
        status: row.status,
        createdAt: row.created_at,
      }));
    });
  },

  /**
   * Get check-in statistics for event
   */
  async getCheckInStats(eventId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           status,
           COUNT(*) as count,
           COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
         FROM registrations
         WHERE event_id = $1
         GROUP BY status`,
        [eventId]
      );

      const stats = {};
      rows.forEach(row => {
        stats[row.status] = {
          count: parseInt(row.count, 10),
          percentage: parseFloat(row.percentage).toFixed(2),
        };
      });

      return stats;
    });
  },

  /**
   * Export analytics data
   */
  async exportEventAnalytics(eventId, format = 'csv') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text,
           r.email,
           r.status,
           r.created_at,
           r.updated_at
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         WHERE e.id = $1
         ORDER BY r.created_at DESC`,
        [eventId]
      );

      return rows;
    });
  },
};
