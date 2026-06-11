import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Fake live data generators
let registrations = 142;
let attendees = 87;
let checkIns = 63;

const eventData = {
  'Tech Summit 2024': { registrations: 450, attendees: 312, checkIns: 289 },
  'Design Workshop': { registrations: 120, attendees: 98, checkIns: 91 },
  'AI Conference': { registrations: 380, attendees: 241, checkIns: 198 },
  'Startup Meetup': { registrations: 200, attendees: 156, checkIns: 143 },
};

const trendHistory = Array.from({ length: 10 }, (_, i) => ({
  time: `${10 - i}m ago`,
  registrations: Math.floor(Math.random() * 50) + 100,
  checkIns: Math.floor(Math.random() * 40) + 60,
})).reverse();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_data', {
    registrations,
    attendees,
    checkIns,
    eventData,
    trendHistory,
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Push live updates every 2 seconds
setInterval(() => {
  registrations += Math.floor(Math.random() * 3);
  attendees += Math.floor(Math.random() * 2);
  checkIns += Math.floor(Math.random() * 2);

  trendHistory.push({
    time: 'now',
    registrations,
    checkIns,
  });
  if (trendHistory.length > 15) trendHistory.shift();

  io.emit('live_update', {
    registrations,
    attendees,
    checkIns,
    trendHistory,
  });
}, 2000);

httpServer.listen(4000, () => {
  console.log('✅ WebSocket server running on http://localhost:4000');
});