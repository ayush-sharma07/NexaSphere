export function mapEventRowToApi(row = {}) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name || row.shortName || row.name || '',
    date: row.date_text || row.date || '',
    description: row.description || '',
    status: row.status || 'completed',
    icon: row.icon || 'Pin',
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export function mapEventInputToDb(event = {}) {
  const dbPayload = {};
  if (event.id !== undefined) dbPayload.id = event.id;
  if (event.name !== undefined) dbPayload.name = event.name;
  if (event.shortName !== undefined) dbPayload.short_name = event.shortName;
  if (event.date !== undefined) dbPayload.date_text = event.date;
  if (event.description !== undefined) dbPayload.description = event.description;
  if (event.status !== undefined) dbPayload.status = event.status;
  if (event.icon !== undefined) dbPayload.icon = event.icon || 'Pin';
  if (event.tags !== undefined) dbPayload.tags = Array.isArray(event.tags) ? event.tags : [];
  return dbPayload;
}
