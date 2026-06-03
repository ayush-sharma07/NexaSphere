import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeEventRecord } from '../utils/sanitize.js';
import { eventSchema, eventPatchSchema } from '../validators/eventSchemas.js';

export const eventsService = {
  async listEvents() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('events?select=*&order=created_at.desc');
      return rows.map((row) => sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.shortName || row.name,
        date: row.date_text || row.date,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    const content = await readContent();
    return (content.events || []).map((event) => sanitizeEventRecord(event));
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);

    if (HAS_SUPABASE) {
      const payload = {
        id: event.id,
        name: event.name,
        short_name: event.shortName,
        date_text: event.date,
        description: event.description,
        status: event.status,
        icon: event.icon,
        tags: event.tags,
      };

      // Do not mutate the identity (id) on failure.
      // If Supabase rejects the insert (e.g., conflict/constraint), fail clearly so the client can
      // retry with the correct id instead of ending up with an “orphan” record.
      let row;
      try {
        [row] = await supabaseRequest('events', { method: 'POST', body: [payload] });
      } catch (err) {
        // Prefer a clear 409-style signal on constraint/id collisions; otherwise rethrow.
        const msg = err?.message ? String(err.message) : '';
        if (/conflict|duplicate|unique|violat/i.test(msg)) {
          throw err;
        }
        throw err;
      }

      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    content.events = content.events || [];
    const now = new Date().toISOString();
    content.events.unshift({ ...event, createdAt: now, updatedAt: now });
    await writeContent(content);
    return sanitizeEventRecord(content.events[0]);
  },

  async updateEvent(id, input) {
    const patch = eventPatchSchema.parse({ ...input, id });

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          name: patch.name,
          short_name: patch.shortName,
          date_text: patch.date,
          description: patch.description,
          status: patch.status,
          icon: patch.icon,
          tags: patch.tags,
          updated_at: new Date().toISOString(),
        },
      });

      if (!row) return null;
      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    const index = (content.events || []).findIndex((event) => event.id === id);
    if (index < 0) return null;

    content.events[index] = { ...content.events[index], ...patch, id, updatedAt: new Date().toISOString() };
    await writeContent(content);
    return sanitizeEventRecord(content.events[index]);
  },

  async deleteEvent(id) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }

    const content = await readContent();
    const before = (content.events || []).length;
    content.events = (content.events || []).filter((event) => event.id !== id);
    if (content.events.length === before) return false;
    await writeContent(content);
    return true;
  },
};
