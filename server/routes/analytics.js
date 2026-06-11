/**
 * Analytics Routes
 * API endpoints for real-time analytics and metrics
 */

import express from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/admin/analytics/events
 * Get metrics for all events
 */
router.get('/events', wrapAsync(async (req, res) => {
  const metrics = await analyticsService.getAllEventsMetrics();
  return res.json({
    ok: true,
    data: metrics,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId
 * Get detailed metrics for a specific event
 */
router.get('/events/:eventId', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const metrics = await analyticsService.getEventMetrics(eventId);
  
  if (!metrics) {
    return res.status(404).json({
      ok: false,
      error: 'Event not found',
    });
  }

  return res.json({
    ok: true,
    data: metrics,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId/trends
 * Get registration trends for an event
 */
router.get('/events/:eventId/trends', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { timeWindow = '7 days' } = req.query;

  const trends = await analyticsService.getRegistrationTrends(eventId, timeWindow);
  
  return res.json({
    ok: true,
    data: trends,
    eventId,
    timeWindow,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId/trends/hourly
 * Get hourly registration trends
 */
router.get('/events/:eventId/trends/hourly', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { hours = 24 } = req.query;

  const trends = await analyticsService.getHourlyRegistrationTrends(eventId, parseInt(hours, 10));
  
  return res.json({
    ok: true,
    data: trends,
    eventId,
    hours: parseInt(hours, 10),
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId/registrations/recent
 * Get recent registrations for an event
 */
router.get('/events/:eventId/registrations/recent', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { limit = 20 } = req.query;

  const registrations = await analyticsService.getRecentRegistrations(eventId, parseInt(limit, 10));
  
  return res.json({
    ok: true,
    data: registrations,
    eventId,
    count: registrations.length,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId/checkin/stats
 * Get check-in statistics for an event
 */
router.get('/events/:eventId/checkin/stats', wrapAsync(async (req, res) => {
  const { eventId } = req.params;

  const stats = await analyticsService.getCheckInStats(eventId);
  
  return res.json({
    ok: true,
    data: stats,
    eventId,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/admin/analytics/events/:eventId/register
 * Record a new registration
 */
router.post('/events/:eventId/register', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { userId, email } = req.body;

  if (!email) {
    return res.status(400).json({
      ok: false,
      error: 'Email is required',
    });
  }

  const registration = await analyticsService.registerForEvent(eventId, { userId, email });
  
  return res.status(201).json({
    ok: true,
    data: registration,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/admin/analytics/events/:eventId/checkin
 * Record a check-in
 */
router.post('/events/:eventId/checkin', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { registrationId, email } = req.body;

  if (!registrationId || !email) {
    return res.status(400).json({
      ok: false,
      error: 'registrationId and email are required',
    });
  }

  const updated = await analyticsService.checkInRegistration(eventId, registrationId, email);
  
  if (!updated) {
    return res.status(404).json({
      ok: false,
      error: 'Registration not found',
    });
  }

  return res.json({
    ok: true,
    data: updated,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/admin/analytics/events/:eventId/export
 * Export analytics data
 */
router.get('/events/:eventId/export', wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { format = 'csv' } = req.query;

  const data = await analyticsService.exportAnalytics(eventId, format);
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${eventId}.csv"`);
    return res.send(data);
  } else if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${eventId}.json"`);
    return res.send(data);
  }

  return res.json({
    ok: true,
    data,
    format,
  });
}));

/**
 * POST /api/admin/analytics/cache/clear
 * Clear analytics cache (admin only)
 */
router.post('/cache/clear', wrapAsync(async (req, res) => {
  const { eventId } = req.body;

  if (eventId) {
    analyticsService.clearCache(eventId);
  } else {
    analyticsService.clearAllCache();
  }

  return res.json({
    ok: true,
    message: eventId ? `Cache cleared for event ${eventId}` : 'All cache cleared',
  });
}));

export default router;
