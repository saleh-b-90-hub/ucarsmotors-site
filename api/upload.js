import { put } from '@vercel/blob';
import crypto from 'node:crypto';
import { isAdmin, send } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    if (!isAdmin(req)) return send(res, 401, { error: 'unauthorized' });
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.dataUrl || ''));
    if (!m) return send(res, 400, { error: 'unsupported_type' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 4 * 1024 * 1024) return send(res, 413, { error: 'too_large' });
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const r = await put('photos/' + crypto.randomUUID() + '.' + ext, buf, {
      access: 'public',
      contentType: 'image/' + m[1],
      addRandomSuffix: false,
    });
    return send(res, 200, { url: r.url });
  } catch (e) {
    return send(res, 500, { error: 'server', message: String(e && e.message || e) });
  }
}
