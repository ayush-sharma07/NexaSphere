import { activityEventsService } from '../services/activityEventsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const listActivityEvents = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const events = await activityEventsService.listActivityEvents(activityKey);
  return res.json({ events });
});

export const addActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const result = await activityEventsService.addActivityEvent(activityKey, req.body);
  return res.status(201).json({ ok: true, event: result });
});

export const deleteActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const eventId = String(req.params.eventId || '').trim();

  // DELETE requests often come without a JSON body. Enforce consistent auth behavior
  // by validating gate fields before calling the service layer.
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const gateMissing =
    !body ||
    !String(body.password ?? '').trim() ||
    !String(body.name ?? '').trim() ||
    !String(body.email ?? '').trim() ||
    !String(body.phone ?? '').trim();

  if (gateMissing) {
    return res.status(401).json({ error: 'Unauthorized. Missing admin gate fields.' });
  }

  const deleted = await activityEventsService.deleteActivityEvent(activityKey, eventId, body);
  if (!deleted) throw new NotFoundError('Event not found in manual activity events.');
  return res.json({ ok: true });
});


