import { del } from '@vercel/blob';
import crypto from 'node:crypto';
import { readState, writeState, isAdmin, send, cleanCar } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { state } = await readState();
      return send(res, 200, state);
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });

    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (b.action === 'check') return send(res, 200, { ok: true });

    const { state, blobs } = await readState();
    const id = typeof b.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(b.id) ? b.id : null;

    if (b.action === 'add') {
      const nid = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
      state.cars[nid] = cleanCar(b.data || {});
      await writeState(state, blobs);
      return send(res, 200, { ok: true, id: nid });
    }
    if (b.action === 'set' && id) {
      state.cars[id] = cleanCar(b.data || {});
      await writeState(state, blobs);
      return send(res, 200, { ok: true });
    }
    if (b.action === 'update' && id && state.cars[id]) {
      state.cars[id] = cleanCar(Object.assign({}, state.cars[id], b.data || {}));
      await writeState(state, blobs);
      return send(res, 200, { ok: true });
    }
    if (b.action === 'delete' && id) {
      delete state.cars[id];
      await writeState(state, blobs);
      return send(res, 200, { ok: true });
    }
    if (b.action === 'settings') {
      const hero = typeof (b.data || {}).hero === 'string' ? b.data.hero : '';
      state.settings = { hero: /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(hero) ? hero : '', updatedAt: Date.now() };
      await writeState(state, blobs);
      return send(res, 200, { ok: true });
    }
    if (b.action === 'deletePhoto' && typeof b.url === 'string' && /\.public\.blob\.vercel-storage\.com\/photos\//.test(b.url)) {
      await del(b.url).catch(() => {});
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { error: 'bad_request' });
  } catch (e) {
    return send(res, 500, { error: 'server', message: String(e && e.message || e) });
  }
}
