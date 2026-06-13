import { eventsRepository } from '../repositories/eventsRepository.js';
import { sanitizeEventRecord } from '../utils/sanitize.js';
import { eventSchema, eventPatchSchema } from '../validators/eventSchemas.js';

export const eventsService = {
  async listEvents() {
    const list = await eventsRepository.list();
    return list.map(sanitizeEventRecord);
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);
    const created = await eventsRepository.create(event);
    return sanitizeEventRecord(created);
  },

  async updateEvent(id, input) {
    const patch = eventPatchSchema.parse({ ...input, id });
    const updated = await eventsRepository.update(id, patch);
    if (!updated) return null;
    return sanitizeEventRecord(updated);
  },

  async deleteEvent(id) {
    return eventsRepository.delete(id);
  },
};
