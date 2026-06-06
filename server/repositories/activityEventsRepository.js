import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';

function mapRow(row) {
  if (!row) return null;
  const createdBy = row.createdBy || (row.created_by_name || row.created_by_email || row.created_by_phone
    ? {
        name: row.created_by_name || '',
        email: row.created_by_email || '',
        phone: row.created_by_phone || '',
      }
    : undefined);

  return {
    id: row.id,
    name: row.name,
    date: row.date_text || row.date || '',
    tagline: row.tagline || '',
    description: row.description || '',
    status: row.status || 'completed',
    createdBy,
    createdAt: row.created_at || row.createdAt || '',
  };
}

export const activityEventsRepository = {
  async listByActivityKey(activityKey) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&select=*&order=created_at.desc`);
      return rows.map(mapRow);
    }

    const content = await readContent();
    return (content.activityEvents?.[activityKey] || []).map(mapRow);
  },

  async create(activityKey, event) {
    if (HAS_SUPABASE) {
      const payload = {
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
      };
      const [row] = await supabaseRequest('activity_events', {
        method: 'POST',
        body: [payload],
      });
      return mapRow(row);
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    content.activityEvents[activityKey] = content.activityEvents[activityKey] || [];
    content.activityEvents[activityKey].unshift(event);
    await writeContent(content);
    return mapRow(event);
  },

  async delete(activityKey, eventId) {
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
