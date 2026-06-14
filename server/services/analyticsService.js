/**
 * Analytics Service
 * Business logic for real-time analytics and metrics
 */

import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { emitToRoom, getIO } from '../config/socket.js';
import logger from '../utils/logger.js';

// In-memory cache for metrics to reduce database queries
const metricsCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

function getCacheKey(eventId) {
  return `metrics:${eventId}`;
}

function isCacheValid(cachedData) {
  if (!cachedData) return false;
  return Date.now() - cachedData.timestamp < CACHE_TTL;
}

export const analyticsService = {
  /**
   * Get event metrics with caching
   */
  async getEventMetrics(eventId, bypassCache = false) {
    const cacheKey = getCacheKey(eventId);
    
    if (!bypassCache && metricsCache.has(cacheKey)) {
      const cached = metricsCache.get(cacheKey);
      if (isCacheValid(cached)) {
        return cached.data;
      }
    }

    const metrics = await analyticsRepository.getEventMetrics(eventId);
    
    if (metrics) {
      metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now(),
      });
    }

    return metrics;
  },

  /**
   * Get all events metrics
   */
  async getAllEventsMetrics() {
    try {
      return await analyticsRepository.getAllEventsMetrics();
    } catch (error) {
      logger.error('Failed to fetch all events metrics', { error: error.message });
      return [];
    }
  },

  /**
   * Get registration trends
   */
  async getRegistrationTrends(eventId, timeWindow = '7 days') {
    try {
      return await analyticsRepository.getRegistrationTrends(eventId, timeWindow);
    } catch (error) {
      logger.error('Failed to fetch registration trends', { eventId, error: error.message });
      return [];
    }
  },

  /**
   * Get hourly registration trends
   */
  async getHourlyRegistrationTrends(eventId, hours = 24) {
    try {
      return await analyticsRepository.getHourlyRegistrationTrends(eventId, hours);
    } catch (error) {
      logger.error('Failed to fetch hourly trends', { eventId, error: error.message });
      return [];
    }
  },

  /**
   * Record a new registration and broadcast update
   */
  async registerForEvent(eventId, userData) {
    try {
      const registration = await analyticsRepository.recordRegistration(
        eventId,
        userData.userId,
        userData.email,
        'registered'
      );

      // Invalidate cache
      metricsCache.delete(getCacheKey(eventId));

      // Get updated metrics
      const metrics = await this.getEventMetrics(eventId, true);

      // Broadcast real-time update
      this.broadcastMetricsUpdate(eventId, metrics);
      this.broadcastRecentRegistration(eventId, {
        email: userData.email,
        status: 'registered',
        timestamp: new Date().toISOString(),
      });

      return registration;
    } catch (error) {
      logger.error('Failed to record registration', { eventId, error: error.message });
      throw error;
    }
  },

  /**
   * Record check-in and broadcast update
   */
  async checkInRegistration(eventId, registrationId, email) {
    try {
      const updated = await analyticsRepository.updateRegistrationStatus(registrationId, 'checked_in');

      // Invalidate cache
      metricsCache.delete(getCacheKey(eventId));

      // Get updated metrics
      const metrics = await this.getEventMetrics(eventId, true);

      // Broadcast updates
      this.broadcastMetricsUpdate(eventId, metrics);
      this.broadcastCheckIn(eventId, {
        email,
        timestamp: new Date().toISOString(),
      });

      return updated;
    } catch (error) {
      logger.error('Failed to check in registration', { eventId, error: error.message });
      throw error;
    }
  },

  /**
   * Get recent registrations
   */
  async getRecentRegistrations(eventId, limit = 20) {
    try {
      return await analyticsRepository.getRecentRegistrations(eventId, limit);
    } catch (error) {
      logger.error('Failed to fetch recent registrations', { eventId, error: error.message });
      return [];
    }
  },

  /**
   * Get check-in statistics
   */
  async getCheckInStats(eventId) {
    try {
      return await analyticsRepository.getCheckInStats(eventId);
    } catch (error) {
      logger.error('Failed to fetch check-in stats', { eventId, error: error.message });
      return {};
    }
  },

  /**
   * Broadcast metrics update to admin clients
   */
  broadcastMetricsUpdate(eventId, metrics) {
    try {
      const io = getIO();
      emitToRoom('admin-room', 'analytics:metrics:update', {
        eventId,
        metrics,
        timestamp: new Date().toISOString(),
      });
      logger.debug('Metrics update broadcasted', { eventId });
    } catch (error) {
      logger.warn('Failed to broadcast metrics update', { error: error.message });
    }
  },

  /**
   * Broadcast recent registration
   */
  broadcastRecentRegistration(eventId, registration) {
    try {
      const io = getIO();
      emitToRoom('admin-room', 'analytics:registration:new', {
        eventId,
        registration,
        timestamp: new Date().toISOString(),
      });
      logger.debug('Recent registration broadcasted', { eventId });
    } catch (error) {
      logger.warn('Failed to broadcast registration', { error: error.message });
    }
  },

  /**
   * Broadcast check-in event
   */
  broadcastCheckIn(eventId, checkInData) {
    try {
      const io = getIO();
      emitToRoom('admin-room', 'analytics:checkin:new', {
        eventId,
        checkIn: checkInData,
        timestamp: new Date().toISOString(),
      });
      logger.debug('Check-in broadcasted', { eventId });
    } catch (error) {
      logger.warn('Failed to broadcast check-in', { error: error.message });
    }
  },

  /**
   * Subscribe to real-time updates for an event
   */
  subscribeToEventAnalytics(socket, eventId) {
    try {
      const room = `analytics:${eventId}`;
      socket.join(room);
      logger.info('Client subscribed to event analytics', { socketId: socket.id, eventId });
    } catch (error) {
      logger.error('Failed to subscribe to analytics', { error: error.message });
    }
  },

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromEventAnalytics(socket, eventId) {
    try {
      const room = `analytics:${eventId}`;
      socket.leave(room);
      logger.info('Client unsubscribed from event analytics', { socketId: socket.id, eventId });
    } catch (error) {
      logger.error('Failed to unsubscribe from analytics', { error: error.message });
    }
  },

  /**
   * Export analytics data
   */
  async exportAnalytics(eventId, format = 'csv') {
    try {
      const data = await analyticsRepository.exportEventAnalytics(eventId, format);
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      } else if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to export analytics', { eventId, error: error.message });
      throw error;
    }
  },

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data || data.length === 0) {
      return 'No data available';
    }

    const headers = ['Event ID', 'Event Name', 'Event Date', 'Email', 'Status', 'Registered At', 'Updated At'];
    const rows = data.map(row => [
      row.id,
      row.name,
      row.date_text,
      row.email || 'N/A',
      row.status || 'N/A',
      row.created_at || 'N/A',
      row.updated_at || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  },

  /**
   * Clear cache for an event
   */
  clearCache(eventId) {
    const cacheKey = getCacheKey(eventId);
    metricsCache.delete(cacheKey);
  },

  /**
   * Clear all cache
   */
  clearAllCache() {
    metricsCache.clear();
  },
};
