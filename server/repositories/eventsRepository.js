import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { mapEventRowToApi, mapEventInputToDb } from '../utils/eventMapper.js';

export const eventsRepository = {
  async list() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('events?select=*&order=created_at.desc');
      return rows.map(mapEventRowToApi);
    }

    const content = await readContent();
    return (content.events || []).map(mapEventRowToApi);
  },

  async create(event) {
    if (HAS_SUPABASE) {
      const payload = mapEventInputToDb(event);
      const [row] = await supabaseRequest('events', { method: 'POST', body: [payload] });
      return mapEventRowToApi(row);
    }

    const content = await readContent();
    content.events = content.events || [];
    const now = new Date().toISOString();
    const newEvent = { ...event, createdAt: now, updatedAt: now };
    content.events.unshift(newEvent);
    await writeContent(content);
    return mapEventRowToApi(content.events[0]);
  },

  async update(id, patch) {
    if (HAS_SUPABASE) {
      const dbPayload = mapEventInputToDb(patch);
      dbPayload.updated_at = new Date().toISOString();

      const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: dbPayload,
      });

      if (!row) return null;
      return mapEventRowToApi(row);
    }

    const content = await readContent();
    const index = (content.events || []).findIndex((event) => event.id === id);
    if (index < 0) return null;

    content.events[index] = { ...content.events[index], ...patch, id, updatedAt: new Date().toISOString() };
    await writeContent(content);
    return mapEventRowToApi(content.events[index]);
  },

  async delete(id) {
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
