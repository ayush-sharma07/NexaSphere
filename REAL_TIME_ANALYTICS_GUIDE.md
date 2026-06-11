# Real-Time Analytics Dashboard - Implementation Guide

## Overview

The Real-Time Analytics Dashboard provides admins with instant visibility into event registration trends, live attendee counts, and engagement metrics through WebSocket-powered real-time updates and advanced analytics.

## Features

### ✨ Key Capabilities

1. **Live Event Metrics**
   - Real-time registration counters
   - Live attendee check-in tracking
   - Occupancy rate monitoring
   - Available seats tracking

2. **Real-Time Charts**
   - Registration trends (line, area, bar charts)
   - Check-in status breakdown (pie chart)
   - Hourly and daily trend analysis
   - Time window selection (1 day, 7 days, 30 days)

3. **Event Monitoring**
   - Recent registrations activity feed
   - Check-in statistics
   - Multi-event overview
   - Live connection status

4. **Data Export**
   - CSV export for spreadsheet analysis
   - JSON export for integration
   - Full analytics data export
   - Timestamped exports

## Architecture

### Backend Stack

#### Database Schema
```sql
-- Registrations Table
- id (UUID, Primary Key)
- event_id (FK to events)
- user_id (Optional)
- email (String, Unique per event)
- name (String)
- status (enum: registered, checked_in, cancelled, no_show)
- created_at, updated_at (Timestamps)

-- Indexes
- event_id (for filtering by event)
- status (for analytics queries)
- created_at DESC (for recent registrations)
- event_id + status (for combined queries)
```

#### Services & Controllers

**Analytics Repository** (`repositories/analyticsRepository.js`)
- `getEventMetrics(eventId)` - Fetch event metrics with aggregations
- `getAllEventsMetrics()` - Dashboard overview
- `getRegistrationTrends(eventId, timeWindow)` - Daily trends
- `getHourlyRegistrationTrends(eventId, hours)` - Hourly trends
- `recordRegistration(eventId, userData)` - Add registration
- `updateRegistrationStatus(registrationId, status)` - Check-in
- `getRecentRegistrations(eventId, limit)` - Activity feed
- `getCheckInStats(eventId)` - Status breakdown
- `exportEventAnalytics(eventId)` - Data export

**Analytics Service** (`services/analyticsService.js`)
- In-memory caching (5-second TTL)
- Real-time WebSocket broadcasting
- Event subscription management
- CSV/JSON data conversion

**Registration Tracking Controller** (`controllers/registrationTrackingController.js`)
- `registerForEvent()` - Handle registrations
- `checkInUser()` - Process check-ins
- `bulkRegister()` - Demo data generation
- Request validation and error handling

#### API Endpoints

```
GET  /api/admin/analytics/events
     → Get all events metrics

GET  /api/admin/analytics/events/:eventId
     → Get specific event metrics

GET  /api/admin/analytics/events/:eventId/trends
     → Get registration trends (query: timeWindow)

GET  /api/admin/analytics/events/:eventId/trends/hourly
     → Get hourly trends (query: hours)

GET  /api/admin/analytics/events/:eventId/registrations/recent
     → Get recent registrations (query: limit)

GET  /api/admin/analytics/events/:eventId/checkin/stats
     → Get check-in statistics

POST /api/admin/analytics/events/:eventId/register
     → Record a registration

POST /api/admin/analytics/events/:eventId/checkin
     → Record a check-in

GET  /api/admin/analytics/events/:eventId/export
     → Export analytics data (query: format=csv|json)

POST /api/admin/analytics/cache/clear
     → Clear cache (admin only)
```

#### WebSocket Events

**Client → Server**
```javascript
// Subscribe to event metrics
socket.emit('analytics:subscribe', eventId);

// Unsubscribe from event metrics
socket.emit('analytics:unsubscribe', eventId);

// Request current metrics
socket.emit('analytics:request:metrics', eventId);

// Request trends
socket.emit('analytics:request:trends', { eventId, timeWindow });
```

**Server → Client**
```javascript
// Metrics update
socket.on('analytics:metrics:update', { eventId, metrics, timestamp });

// New registration
socket.on('analytics:registration:new', { eventId, registration, timestamp });

// New check-in
socket.on('analytics:checkin:new', { eventId, checkIn, timestamp });

// Current data response
socket.on('analytics:metrics:current', { eventId, metrics });
socket.on('analytics:trends:current', { eventId, trends, timeWindow });

// Error response
socket.on('analytics:error', { eventId, error });
```

### Frontend Stack

#### React Components

**AnalyticsDashboard** (`components/AnalyticsDashboard.jsx`)
- Main orchestrator component
- Manages analytics data flow
- Fetches all events overview
- Handles refresh functionality

**LiveMetricsCards** (`components/LiveMetricsCards.jsx`)
- Displays key metrics in card format
- Shows:
  - Total registrations
  - Checked-in count
  - Pending check-ins
  - Available seats
  - Occupancy rate

**RegistrationTrendsChart** (`components/RegistrationTrendsChart.jsx`)
- Recharts integration
- Multiple chart types (line, area, bar)
- Time window selection
- Custom tooltips
- Responsive design

**CheckInStatsChart** (`components/CheckInStatsChart.jsx`)
- Pie/doughnut chart visualization
- Status breakdown
- Color-coded legend
- Percentage display

**RecentRegistrationsList** (`components/RecentRegistrationsList.jsx`)
- Activity feed component
- Real-time updates
- Email truncation
- Status indicators

**AnalyticsExport** (`components/AnalyticsExport.jsx`)
- CSV/JSON export buttons
- Download management
- User feedback
- Data format options

#### Custom Hooks

**useAnalyticsSocket** (`hooks/useAnalyticsSocket.js`)
```javascript
// Get Socket.IO instance
const socket = useAnalyticsSocket();

// Subscribe to event analytics
const {
  metrics,
  registrationTrends,
  recentRegistrations,
  loading,
  error,
  isConnected
} = useEventAnalytics(eventId);
```

#### API Service

**analyticsAPI** (`services/analyticsAPI.js`)
```javascript
// Fetch operations
getAllEventsMetrics()
getEventMetrics(eventId)
getRegistrationTrends(eventId, timeWindow)
getHourlyTrends(eventId, hours)
getRecentRegistrations(eventId, limit)
getCheckInStats(eventId)

// Mutation operations
registerForEvent(eventId, email, name)
checkInUser(eventId, registrationId, email)

// Export operations
exportAnalytics(eventId, format)

// Admin operations
clearCache(eventId)
```

#### Styling

**analytics-dashboard.css** - Comprehensive styling
- Responsive grid layouts
- Real-time connection indicator
- Animated loading states
- Gradient backgrounds
- Interactive components
- Mobile-first design
- Dark mode compatible

## Installation & Setup

### 1. Database Setup

Run the analytics schema script to create necessary tables:

```bash
# Using psql with Supabase
psql -h <host> -U <user> -d <database> -f server/analytics-schema.sql

# Or apply migrations to Supabase
# Copy the SQL from analytics-schema.sql and run in Supabase SQL editor
```

### 2. Backend Configuration

Environment variables needed:
```env
# Socket.IO
SOCKET_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173

# Database
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
```

### 3. Frontend Dependencies

```bash
cd admin-dashboard
npm install
# or
yarn install
```

This installs:
- `recharts@^2.10.3` - Chart visualization
- `socket.io-client@^4.7.2` - WebSocket client

### 4. Start Services

```bash
# Terminal 1: Backend server
cd server
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Admin dashboard
cd admin-dashboard
npm run dev
# Runs on http://localhost:5173
```

## Usage

### For Admins

1. **Access Dashboard**
   - Navigate to `/analytics` or import `AnalyticsDashboard` component
   - Pass `eventId` prop to component

2. **View Live Metrics**
   - Metrics update in real-time via WebSocket
   - Live connection indicator shows status
   - Cards animate on value changes

3. **Analyze Trends**
   - Select time window (1 day, 7 days, 30 days)
   - Switch between chart types
   - Hover for detailed tooltips

4. **Export Data**
   - Click "Export as CSV" or "Export as JSON"
   - File downloads automatically
   - Use for external analysis

5. **Refresh Data**
   - Click refresh button to clear cache
   - Fetches latest data from database
   - All connected clients update

### For Developers

#### Recording Registrations

```javascript
import analyticsAPI from './services/analyticsAPI';

// Register user for event
await analyticsAPI.registerForEvent('event-id', 'user@email.com', 'User Name');
```

#### Recording Check-ins

```javascript
// Check in user
await analyticsAPI.checkInUser('event-id', 'registration-id', 'user@email.com');
```

#### Subscribing to Real-time Updates

```javascript
import { useEventAnalytics } from './hooks/useAnalyticsSocket';

function MyComponent() {
  const { metrics, isConnected } = useEventAnalytics('event-id');
  
  return (
    <div>
      {isConnected && <p>Live: {metrics.totalRegistrations}</p>}
    </div>
  );
}
```

#### Fetching Historical Data

```javascript
import analyticsAPI from './services/analyticsAPI';

// Get 30-day trends
const trends = await analyticsAPI.getRegistrationTrends('event-id', '30 days');

// Get check-in stats
const stats = await analyticsAPI.getCheckInStats('event-id');
```

## Performance Optimization

### Caching Strategy

- **In-Memory Cache**: 5-second TTL on metrics
- **Database Indexes**: Query optimization for common filters
- **WebSocket Broadcasting**: Efficient real-time updates
- **Lazy Loading**: Charts load only when visible

### Scalability Considerations

1. **Database**
   - Use indexes on event_id, status, created_at
   - Archive old registrations (>1 year) to separate table
   - Partition registrations table by event_id

2. **Cache**
   - Implement Redis for distributed caching
   - TTL: 5-30 seconds based on update frequency
   - Clear cache on new registrations/check-ins

3. **WebSocket**
   - Use Socket.IO adapters for multiple servers
   - Implement room-based broadcasting
   - Limit subscriber count per event

4. **Frontend**
   - Virtual scrolling for large lists
   - Debounce chart updates
   - Lazy load components

## Testing

### Sample Data Generation

Use bulk registration endpoint for testing:

```bash
curl -X POST http://localhost:3001/api/admin/analytics/events/event-id/bulk-register \
  -H "Content-Type: application/json" \
  -d '{
    "registrations": [
      {"email": "user1@test.com", "name": "User 1"},
      {"email": "user2@test.com", "name": "User 2"}
    ]
  }'
```

### Unit Tests

Example test structure:
```javascript
describe('analyticsService', () => {
  test('getEventMetrics returns correct structure', async () => {
    const metrics = await analyticsService.getEventMetrics('test-event');
    expect(metrics).toHaveProperty('totalRegistrations');
    expect(metrics).toHaveProperty('checkedIn');
  });
});
```

## Troubleshooting

### Common Issues

1. **WebSocket not connecting**
   - Check CORS_ORIGIN configuration
   - Verify Socket.IO port is accessible
   - Check browser console for connection errors

2. **Metrics not updating**
   - Verify database connection
   - Check socket subscription (check browser DevTools)
   - Clear cache and refresh

3. **Charts not rendering**
   - Verify Recharts installation
   - Check data format matches chart expectations
   - Browser console for React errors

4. **Performance issues**
   - Check database indexes
   - Monitor cache hit rate
   - Profile component renders

### Debug Mode

Enable verbose logging:
```javascript
// In Socket.IO hook
useEffect(() => {
  socket.onAny((eventName, ...args) => {
    console.log('[SOCKET]', eventName, args);
  });
}, [socket]);
```

## Security Considerations

1. **Authentication**
   - All analytics endpoints require admin authentication
   - Socket connections validated via auth middleware

2. **Data Privacy**
   - Emails and user data protected in database
   - Access logs maintained for audit
   - Rate limiting on API endpoints

3. **WebSocket Security**
   - Secure WebSocket (WSS) in production
   - Connection validation on subscription
   - Rate limiting per socket connection

## Future Enhancements

1. **Advanced Analytics**
   - Predictive analytics for registration trends
   - Anomaly detection for unusual patterns
   - Cohort analysis for user segments

2. **Integrations**
   - Email notifications for milestones
   - Slack notifications for check-in events
   - Google Sheets export automation

3. **UI Improvements**
   - Dark mode support
   - Customizable dashboards
   - Comparison tools (event vs event)
   - Time zone support

4. **Performance**
   - Server-side aggregation
   - Time-series database integration
   - Real-time alerts/notifications

## Support & Documentation

- **API Documentation**: See `API_DOCUMENTATION_GUIDE.md`
- **Database Schema**: See `server/analytics-schema.sql`
- **Component Props**: See component files for prop documentation
- **Hook Usage**: See `hooks/useAnalyticsSocket.js` for hook documentation

## License

Part of NexaSphere project. See LICENSE for details.
