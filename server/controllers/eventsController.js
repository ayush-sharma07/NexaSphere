import { eventsService } from '../services/eventsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import { sendList, sendItem, sendCreated, sendDeleted } from '../utils/responseHelper.js';

export const listEvents = wrapAsync(async (req, res) => {
  const events = await eventsService.listEvents();
  return sendList(res, events, 'events');
});

export const adminListEvents = wrapAsync(async (req, res) => {
  const events = await eventsService.listEvents();
  return sendList(res, events, 'events');
});

export const adminCreateEvent = wrapAsync(async (req, res) => {
  const input = req.body || {};
  if (!input.name || !input.date || !input.description) {
    return res.status(400).json({ error: 'name, date and description are required' });
  }
  const created = await eventsService.createEvent(input);
  return sendCreated(res, created, 'event');
});

export const adminUpdateEvent = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const updated = await eventsService.updateEvent(id, req.body);
  if (!updated) throw new NotFoundError('Event not found');
  return sendItem(res, updated, 'event');
});

export const adminDeleteEvent = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const deleted = await eventsService.deleteEvent(id);
  if (!deleted) throw new NotFoundError('Event not found');
  return sendDeleted(res);
});
