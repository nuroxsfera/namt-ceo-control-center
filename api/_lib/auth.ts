export function assertCronAuth(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CRON_SECRET
  if (!secret) return { ok: true }
  const auth = req.headers.get('authorization') || ''
  if (auth === `Bearer ${secret}`) return { ok: true }
  return { ok: false, status: 401, error: 'Unauthorized cron request' }
}
