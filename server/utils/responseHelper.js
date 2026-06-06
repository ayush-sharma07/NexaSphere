export function sendList(res, data, listKey) {
  const response = { ok: true, data };
  if (listKey) {
    response[listKey] = data;
  }
  return res.json(response);
}

export function sendItem(res, data, itemKey) {
  const response = { ok: true, data };
  if (itemKey) {
    response[itemKey] = data;
  }
  return res.json(response);
}

export function sendCreated(res, data, itemKey, spread = false) {
  const response = { ok: true, data };
  if (itemKey) {
    response[itemKey] = data;
  }
  if (spread && data && typeof data === 'object') {
    Object.assign(response, data);
  }
  return res.status(201).json(response);
}

export function sendDeleted(res) {
  return res.json({ ok: true });
}
