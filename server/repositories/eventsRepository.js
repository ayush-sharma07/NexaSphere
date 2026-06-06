import { withDb } from './db.js';
import { mapEventRowToApi, mapEventInputToDb } from '../utils/eventMapper.js';

export const eventsRepository = {
  async list() {
    return withDb(async (client) => {
      const { rows } = await client.query('select * from events order by created_at desc');
      return rows.map(mapEventRowToApi);
    });
  },

  async create(event) {
    const dbRow = mapEventInputToDb(event);
    return withDb(async (client) => {
      const { rows } = await client.query(
        `insert into events (id, name, short_name, date_text, description, status, icon, tags)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (id) do update set
           name=excluded.name,
           short_name=excluded.short_name,
           date_text=excluded.date_text,
           description=excluded.description,
           status=excluded.status,
           icon=excluded.icon,
           tags=excluded.tags,
           updated_at=now()
         returning *`,
        [dbRow.id, dbRow.name, dbRow.short_name, dbRow.date_text, dbRow.description, dbRow.status, dbRow.icon, dbRow.tags]
      );
      return mapEventRowToApi(rows[0]);
    });
  },

  async update(id, patch) {
    const dbRow = mapEventInputToDb(patch);
    return withDb(async (client) => {
      const { rows } = await client.query(
        `update events set
           name = coalesce($2, name),
           short_name = coalesce($3, short_name),
           date_text = coalesce($4, date_text),
           description = coalesce($5, description),
           status = coalesce($6, status),
           icon = coalesce($7, icon),
           tags = coalesce($8, tags),
           updated_at = now()
         where id = $1
         returning *`,
        [id, dbRow.name ?? null, dbRow.short_name ?? null, dbRow.date_text ?? null, dbRow.description ?? null, dbRow.status ?? null, dbRow.icon ?? null, dbRow.tags ?? null]
      );
      if (!rows.length) return null;
      return mapEventRowToApi(rows[0]);
    });
  },

  async delete(id) {
    return withDb(async (client) => {
      const { rowCount } = await client.query('delete from events where id=$1', [id]);
      return rowCount > 0;
    });
  },
};
