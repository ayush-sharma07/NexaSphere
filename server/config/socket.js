/**
 * Socket.IO Configuration
 * Handles WebSocket connections for real-time updates
 */

import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let io = null;
const connectedUsers = new Map();
const analyticsSubscriptions = new Map(); // Track analytics subscriptions
const rooms = {
  admin: 'admin-room',
  notifications: 'notifications-room',
  events: 'events-room',
  analytics: 'analytics-room',
};

/**
 * Initialize Socket.IO
 * @param {Object} httpServer - HTTP server instance
 */
export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  io.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });

    // Store connected user
    socket.on('user:identify', (userData) => {
      connectedUsers.set(socket.id, {
        id: userData.userId,
        email: userData.email,
        socketId: socket.id,
        connectedAt: new Date(),
      });
      logger.info('User identified', { userId: userData.userId, socketId: socket.id });
    });

    // Join notification room
    socket.on('room:join', (roomName) => {
      socket.join(roomName);
      logger.info('User joined room', { socketId: socket.id, room: roomName });
    });

    // Leave room
    socket.on('room:leave', (roomName) => {
      socket.leave(roomName);
      logger.info('User left room', { socketId: socket.id, room: roomName });
    });

    // Analytics: Subscribe to event metrics
    socket.on('analytics:subscribe', (eventId) => {
      const room = `analytics:${eventId}`;
      socket.join(room);
      
      if (!analyticsSubscriptions.has(eventId)) {
        analyticsSubscriptions.set(eventId, new Set());
      }
      analyticsSubscriptions.get(eventId).add(socket.id);

      logger.info('Client subscribed to event analytics', { socketId: socket.id, eventId });
      socket.emit('analytics:subscribed', { eventId });
    });

    // Analytics: Unsubscribe from event metrics
    socket.on('analytics:unsubscribe', (eventId) => {
      const room = `analytics:${eventId}`;
      socket.leave(room);

      if (analyticsSubscriptions.has(eventId)) {
        analyticsSubscriptions.get(eventId).delete(socket.id);
        if (analyticsSubscriptions.get(eventId).size === 0) {
          analyticsSubscriptions.delete(eventId);
        }
      }

      logger.info('Client unsubscribed from event analytics', { socketId: socket.id, eventId });
    });

    // Analytics: Request live metrics
    socket.on('analytics:request:metrics', async (eventId) => {
      try {
        const { analyticsService } = await import('../services/analyticsService.js');
        const metrics = await analyticsService.getEventMetrics(eventId);
        socket.emit('analytics:metrics:current', { eventId, metrics });
      } catch (error) {
        logger.error('Failed to fetch metrics for socket', { socketId: socket.id, eventId, error: error.message });
        socket.emit('analytics:error', { eventId, error: 'Failed to fetch metrics' });
      }
    });

    // Analytics: Request registration trends
    socket.on('analytics:request:trends', async (data) => {
      const { eventId, timeWindow = '7 days' } = data;
      try {
        const { analyticsService } = await import('../services/analyticsService.js');
        const trends = await analyticsService.getRegistrationTrends(eventId, timeWindow);
        socket.emit('analytics:trends:current', { eventId, trends, timeWindow });
      } catch (error) {
        logger.error('Failed to fetch trends for socket', { socketId: socket.id, eventId, error: error.message });
        socket.emit('analytics:error', { eventId, error: 'Failed to fetch trends' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      
      // Remove from analytics subscriptions
      for (const [eventId, subscribers] of analyticsSubscriptions.entries()) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          analyticsSubscriptions.delete(eventId);
        }
      }

      logger.info('User disconnected', { socketId: socket.id });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', { error: error.message, socketId: socket.id });
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit event to all connected clients
 */
export function broadcastEvent(eventName, data) {
  if (!io) return;
  io.emit(eventName, data);
  logger.debug('Broadcast event', { event: eventName });
}

/**
 * Emit event to specific room
 */
export function emitToRoom(roomName, eventName, data) {
  if (!io) return;
  io.to(roomName).emit(eventName, data);
  logger.debug('Emit to room', { room: roomName, event: eventName });
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId, eventName, data) {
  if (!io) return;
  const user = Array.from(connectedUsers.values()).find(u => u.id === userId);
  if (user) {
    io.to(user.socketId).emit(eventName, data);
    logger.debug('Emit to user', { userId, event: eventName });
  }
}

/**
 * Get connected users count
 */
export function getConnectedUsersCount() {
  return connectedUsers.size;
}

/**
 * Get all connected users
 */
export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

/**
 * Get room reference
 */
export function getRoom(roomType) {
  return rooms[roomType] || null;
}

export default { initializeSocketIO, getIO, broadcastEvent, emitToRoom, emitToUser };
