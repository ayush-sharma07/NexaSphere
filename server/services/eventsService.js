import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeEventRecord } from '../utils/sanitize.js';
import { eventSchema, eventPatchSchema } from '../validators/eventSchemas.js';
import { mapEventRowToApi, mapEventInputToDb } from '../utils/eventMapper.js';

export const eventsService = {
  async listEvents() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('events?select=*&order=created_at.desc');
      return rows.map((row) => sanitizeEventRecord(mapEventRowToApi(row)));
    }

    const content = await readContent();
    return (content.events || []).map((event) => sanitizeEventRecord(mapEventRowToApi(event)));
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);

    if (HAS_SUPABASE) {
      const payload = mapEventInputToDb(event);

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

      return sanitizeEventRecord(mapEventRowToApi(row));
    }

    const content = await readContent();
    content.events = content.events || [];
    const now = new Date().toISOString();
    const newEvent = { ...event, createdAt: now, updatedAt: now };
    content.events.unshift(newEvent);
    await writeContent(content);
    return sanitizeEventRecord(mapEventRowToApi(content.events[0]));
  },

  async updateEvent(id, input) {
    const patch = eventPatchSchema.parse({ ...input, id });

    if (HAS_SUPABASE) {
      const dbPayload = mapEventInputToDb(patch);
      dbPayload.updated_at = new Date().toISOString();

      const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: dbPayload,
      });

      if (!row) return null;
      return sanitizeEventRecord(mapEventRowToApi(row));
    }

    const content = await readContent();
    const index = (content.events || []).findIndex((event) => event.id === id);
    if (index < 0) return null;

    content.events[index] = { ...content.events[index], ...patch, id, updatedAt: new Date().toISOString() };
    await writeContent(content);
    return sanitizeEventRecord(mapEventRowToApi(content.events[index]));
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
