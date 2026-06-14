/**
 * Registration Tracking Controller
 * Handles real-time registration and check-in events
 */

import { analyticsService } from '../services/analyticsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Register a user for an event
 */
export const registerForEvent = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { userId, email, name } = req.body;

  if (!email) {
    return res.status(400).json({
      ok: false,
      error: 'Email is required',
    });
  }

  try {
    const registration = await analyticsService.registerForEvent(eventId, {
      userId,
      email,
      name,
    });

    logger.info('User registered for event', {
      eventId,
      email,
      registrationId: registration.id,
    });

    return res.status(201).json({
      ok: true,
      data: registration,
    });
  } catch (error) {
    logger.error('Registration failed', { eventId, email, error: error.message });
    return res.status(500).json({
      ok: false,
      error: 'Registration failed',
    });
  }
});

/**
 * Check in a user to an event
 */
export const checkInUser = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { registrationId, email } = req.body;

  if (!registrationId || !email) {
    return res.status(400).json({
      ok: false,
      error: 'registrationId and email are required',
    });
  }

  try {
    const updated = await analyticsService.checkInRegistration(eventId, registrationId, email);

    if (!updated) {
      return res.status(404).json({
        ok: false,
        error: 'Registration not found',
      });
    }

    logger.info('User checked in', {
      eventId,
      email,
      registrationId,
    });

    return res.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Check-in failed', { eventId, email, error: error.message });
    return res.status(500).json({
      ok: false,
      error: 'Check-in failed',
    });
  }
});

/**
 * Get event metrics
 */
export const getEventMetrics = wrapAsync(async (req, res) => {
  const { eventId } = req.params;

  try {
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
    });
  } catch (error) {
    logger.error('Failed to fetch metrics', { eventId, error: error.message });
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch metrics',
    });
  }
});

/**
 * Get registration trends
 */
export const getRegistrationTrends = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { timeWindow = '7 days' } = req.query;

  try {
    const trends = await analyticsService.getRegistrationTrends(eventId, timeWindow);

    return res.json({
      ok: true,
      data: trends,
      timeWindow,
    });
  } catch (error) {
    logger.error('Failed to fetch trends', { eventId, error: error.message });
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch trends',
    });
  }
});

/**
 * Bulk registration (for demo/testing)
 */
export const bulkRegister = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { registrations } = req.body;

  if (!Array.isArray(registrations) || registrations.length === 0) {
    return res.status(400).json({
      ok: false,
      error: 'registrations array is required and must not be empty',
    });
  }

  const results = [];
  const errors = [];

  for (const reg of registrations) {
    try {
      if (!reg.email) {
        errors.push({ email: reg.email, error: 'Email is required' });
        continue;
      }

      const registration = await analyticsService.registerForEvent(eventId, {
        userId: reg.userId,
        email: reg.email,
        name: reg.name,
      });

      results.push(registration);
    } catch (error) {
      errors.push({ email: reg.email, error: error.message });
    }
  }

  logger.info('Bulk registration completed', {
    eventId,
    successful: results.length,
    failed: errors.length,
  });

  return res.status(201).json({
    ok: true,
    data: {
      successful: results.length,
      failed: errors.length,
      registrations: results,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});
