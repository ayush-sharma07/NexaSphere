import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeActivityEventRecord } from '../utils/sanitize.js';
import { activityEventSchema } from '../validators/activityEventSchemas.js';
import { coreTeamService } from './coreTeamService.js';

function toSafeString(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export const activityEventsService = {
  async listActivityEvents(activityKey) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&select=*&order=created_at.desc`);
      return rows.map((row) => sanitizeActivityEventRecord({
        id: row.id,
        name: row.name,
        date: row.date_text || row.date,
        tagline: row.tagline,
        description: row.description,
        status: row.status || 'completed',
        createdAt: row.created_at,
      }));
    }

    const content = await readContent();
    return (content.activityEvents?.[activityKey] || []).map((event) => sanitizeActivityEventRecord(event));
  },

  async addActivityEvent(activityKey, input) {
    const event = activityEventSchema.parse(input);

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest('activity_events', {
        method: 'POST',
        body: [{
          id: event.id,
          activity_key: activityKey,
          name: event.name,
          date_text: event.date,
          tagline: event.tagline,
          description: event.description,
          status: event.status,
          created_by_name: event.createdBy?.name || '',
          created_by_email: event.createdBy?.email || '',
          created_by_phone: event.createdBy?.phone || '',
        }],
      });

      return sanitizeActivityEventRecord({
        id: row.id,
        name: row.name,
        date: row.date_text,
        tagline: row.tagline,
        description: row.description,
        status: row.status || 'completed',
        createdAt: row.created_at,
      });
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    content.activityEvents[activityKey] = content.activityEvents[activityKey] || [];
    content.activityEvents[activityKey].unshift(event);
    await writeContent(content);
    return sanitizeActivityEventRecord(event);
  },

  async deleteActivityEvent(activityKey, eventId, body) {
    await coreTeamService.assertCanManageActivityEvent(body);

    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&id=eq.${encodeURIComponent(eventId)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    const list = content.activityEvents[activityKey] || [];
    const next = list.filter((event) => event.id !== eventId);
    if (next.length === list.length) return false;
    content.activityEvents[activityKey] = next;
    await writeContent(content);
    return true;
  },
};
