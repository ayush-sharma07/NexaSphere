import { activityEventsService } from '../services/activityEventsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import { sendList, sendCreated, sendDeleted } from '../utils/responseHelper.js';

export const listActivityEvents = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const events = await activityEventsService.listActivityEvents(activityKey);
  return sendList(res, events, 'events');
});

export const addActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const result = await activityEventsService.addActivityEvent(activityKey, req.body);
  return sendCreated(res, result, 'event');
});

export const deleteActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const eventId = String(req.params.eventId || '').trim();
  const body = req.body || {};

  const deleted = await activityEventsService.deleteActivityEvent(activityKey, eventId, body);
  if (!deleted) throw new NotFoundError('Event not found in manual activity events.');
  return sendDeleted(res);
});
