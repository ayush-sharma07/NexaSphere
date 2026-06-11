/**
 * Hook for Socket.IO analytics integration
 * Manages real-time connection and data updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

/**
 * Hook to manage analytics WebSocket connection
 */
export function useAnalyticsSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
}

/**
 * Hook to subscribe to event analytics
 */
export function useEventAnalytics(eventId) {
  const socket = useAnalyticsSocket();
  const [metrics, setMetrics] = useState(null);
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [checkInStats, setCheckInStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to event analytics
  useEffect(() => {
    if (!socket || !eventId) return;

    setLoading(true);

    // Subscribe to the event
    socket.emit('analytics:subscribe', eventId);

    // Request current data
    socket.emit('analytics:request:metrics', eventId);
    socket.emit('analytics:request:trends', { eventId, timeWindow: '7 days' });

    // Listen for updates
    const handleMetricsUpdate = (data) => {
      if (data.eventId === eventId) {
        setMetrics(data.metrics);
        setLoading(false);
      }
    };

    const handleMetricsCurrent = (data) => {
      if (data.eventId === eventId) {
        setMetrics(data.metrics);
        setLoading(false);
      }
    };

    const handleTrendsCurrent = (data) => {
      if (data.eventId === eventId) {
        setRegistrationTrends(data.trends || []);
      }
    };

    const handleRecentRegistration = (data) => {
      if (data.eventId === eventId) {
        setRecentRegistrations(prev => [data.registration, ...prev].slice(0, 20));
      }
    };

    const handleCheckIn = (data) => {
      if (data.eventId === eventId) {
        // Update metrics to reflect check-in
        socket.emit('analytics:request:metrics', eventId);
      }
    };

    const handleError = (data) => {
      if (data.eventId === eventId) {
        setError(data.error);
        setLoading(false);
      }
    };

    socket.on('analytics:metrics:update', handleMetricsUpdate);
    socket.on('analytics:metrics:current', handleMetricsCurrent);
    socket.on('analytics:trends:current', handleTrendsCurrent);
    socket.on('analytics:registration:new', handleRecentRegistration);
    socket.on('analytics:checkin:new', handleCheckIn);
    socket.on('analytics:error', handleError);

    return () => {
      socket.off('analytics:metrics:update', handleMetricsUpdate);
      socket.off('analytics:metrics:current', handleMetricsCurrent);
      socket.off('analytics:trends:current', handleTrendsCurrent);
      socket.off('analytics:registration:new', handleRecentRegistration);
      socket.off('analytics:checkin:new', handleCheckIn);
      socket.off('analytics:error', handleError);
      socket.emit('analytics:unsubscribe', eventId);
    };
  }, [socket, eventId]);

  return {
    metrics,
    registrationTrends,
    recentRegistrations,
    checkInStats,
    loading,
    error,
    isConnected: socket?.connected || false,
  };
}

/**
 * Hook to emit events via socket
 */
export function useSocketEmit(socket) {
  return useCallback((event, data, callback) => {
    if (!socket) return;
    socket.emit(event, data, callback);
  }, [socket]);
}

export default useAnalyticsSocket;
