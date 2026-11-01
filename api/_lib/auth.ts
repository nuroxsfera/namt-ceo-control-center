/**
 * Protect cron routes with CRON_SECRET.
 * Optional MEDIA_API_SECRET for write operations from the SPA.
 */

export function assertCronAuth(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when configured
    return { ok: true }
  }
  const auth = req.headers.get('authorization') || ''
  if (auth === `Bearer ${secret}`) return { ok: true }
  return { ok: false, status: 401, error: 'Unauthorized cron request' }
}

export function assertMediaWriteAuth(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.MEDIA_API_SECRET
  if (!secret) {
    // If not set, allow writes from same deployment (MVP). Set MEDIA_API_SECRET in production.
    return { ok: true }
  }
  const auth = req.headers.get('authorization') || ''
  const header = req.headers.get('x-namt-media-secret') || ''
  if (auth === `Bearer ${secret}` || header === secret) return { ok: true }
  return { ok: false, status: 401, error: 'Unauthorized' }
}
