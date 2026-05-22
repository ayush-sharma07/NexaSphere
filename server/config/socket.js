/**
 * Socket.IO Configuration
 * Optimized real-time communication layer
 */

import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let io;

const connectedUsers = new Map();

export const SOCKET_ROOMS = Object.freeze({
    ADMIN: 'admin-room',
    NOTIFICATIONS: 'notifications-room',
    EVENTS: 'events-room',
});

const socketConfig = {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
};

const log = (level, message, meta = {}) => logger[level](message, meta);

/* ─────────────────────────────
   Initialize Socket.IO
───────────────────────────── */
export const initializeSocketIO = (httpServer) => {
    io = new Server(httpServer, socketConfig);

    io.on('connection', (socket) => {
        log('info', 'Socket connected', { socketId: socket.id });

        // User Identification
        socket.on('user:identify', ({ userId, email }) => {
            connectedUsers.set(socket.id, {
                id: userId,
                email,
                socketId: socket.id,
                connectedAt: new Date(),
            });

            log('info', 'User identified', { userId, socketId: socket.id });
        });

        // Join Room
        socket.on('room:join', (room) => {
            socket.join(room);
            log('info', 'Joined room', { socketId: socket.id, room });
        });

        // Leave Room
        socket.on('room:leave', (room) => {
            socket.leave(room);
            log('info', 'Left room', { socketId: socket.id, room });
        });

        // Error Handling
        socket.on('error', (error) => {
            log('error', 'Socket error', {
                socketId: socket.id,
                error: error.message,
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            log('info', 'Socket disconnected', { socketId: socket.id });
        });
    });

    return io;
};

/* ─────────────────────────────
   Get IO Instance
───────────────────────────── */
export const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

/* ─────────────────────────────
   Emit Helpers
───────────────────────────── */
export const broadcastEvent = (event, data) => {
    if (!io) return;
    io.emit(event, data);

    log('debug', 'Broadcast event', { event });
};

export const emitToRoom = (room, event, data) => {
    if (!io) return;
    io.to(room).emit(event, data);

    log('debug', 'Room event emitted', { room, event });
};

export const emitToUser = (userId, event, data) => {
    if (!io) return;

    const user = [...connectedUsers.values()].find(
        ({ id }) => id === userId
    );

    if (!user) return;

    io.to(user.socketId).emit(event, data);

    log('debug', 'User event emitted', { userId, event });
};

/* ─────────────────────────────
   User Utilities
───────────────────────────── */
export const getConnectedUsersCount = () => connectedUsers.size;

export const getConnectedUsers = () => [
    ...connectedUsers.values(),
];

export const getRoom = (type) => SOCKET_ROOMS[type ? .toUpperCase()] || null;

/* ─────────────────────────────
   Default Export
───────────────────────────── */
export default {
    initializeSocketIO,
    getIO,
    broadcastEvent,
    emitToRoom,
    emitToUser,
    getConnectedUsers,
    getConnectedUsersCount,
    getRoom,
};