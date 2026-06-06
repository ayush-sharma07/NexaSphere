import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { sanitizeActivityEventRecord } from '../utils/sanitize.js';
import { activityEventSchema } from '../schemas/activityEventSchema.js';
import { coreTeamService } from './coreTeamService.js';

export const activityEventsService = {
  async listActivityEvents(activityKey) {
    const list = await activityEventsRepository.listByActivityKey(activityKey);
    return list.map((event) => sanitizeActivityEventRecord(event));
  },

  async addActivityEvent(activityKey, input) {
    const event = activityEventSchema.parse(input);
    const created = await activityEventsRepository.create(activityKey, event);
    return sanitizeActivityEventRecord(created);
  },

  async deleteActivityEvent(activityKey, eventId, body) {
    await coreTeamService.assertCanManageActivityEvent(body);
    return activityEventsRepository.delete(activityKey, eventId);
  },
};
