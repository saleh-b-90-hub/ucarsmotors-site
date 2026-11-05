import { put, list, del } from '@vercel/blob';
import crypto from 'node:crypto';

const PREFIX = 'data/state-';

export async function readState() {
  let blobs = [];
  let cursor;
  do {
    const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs = blobs.concat(r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  if (!blobs.length) return { state: { cars: {}, settings: {} }, blobs };
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const res = await fetch(blobs[0].url, { cache: 'no-store' });
  const state = res.ok ? await res.json() : { cars: {}, settings: {} };
  state.cars = state.cars || {};
  state.settings = state.settings || {};
  return { state, blobs };
}

export async function writeState(state, oldBlobs) {
  await put(PREFIX + Date.now() + '.json', JSON.stringify(state), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  });
  // keep the 5 newest older versions as backup, remove the rest
  const old = (oldBlobs || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(5);
  if (old.length) await del(old.map((b) => b.url)).catch(() => {});
}

export function isAdmin(req) {
  const want = process.env.ADMIN_PASSWORD || '';
  const got = String(req.headers['x-admin-key'] || '');
  if (!want || !got) return false;
  const a = crypto.createHash('sha256').update(want).digest();
  const b = crypto.createHash('sha256').update(got).digest();
  return crypto.timingSafeEqual(a, b);
}

export function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function cleanCar(d) {
  const s = (v, n) => (v == null ? '' : String(v).slice(0, n || 200));
  const num = (v) => (v === null || v === '' || v === undefined || isNaN(Number(v)) ? null : Math.round(Number(v)));
  const status = ['available', 'coming', 'reserved', 'sold', 'hidden'].includes(d.status) ? d.status : 'available';
  const photos = Array.isArray(d.photos) ? d.photos.filter((p) => typeof p === 'string' && /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(p)).slice(0, 30) : [];
  return {
    make: s(d.make, 60), model: s(d.model, 80), body: s(d.body, 30), reg: s(d.reg, 7),
    km: num(d.km), kw: num(d.kw), fuel: s(d.fuel, 30), gear: s(d.gear, 30), price: num(d.price),
    status, desc: s(d.desc, 4000), photos,
    createdAt: num(d.createdAt) || Date.now(), updatedAt: Date.now(),
  };
}
