import type { VercelRequest, VercelResponse } from '@vercel/node'
import { assertCronAuth } from '../_lib/auth'
import { getTelegramConfig, sendMessage, sendPhoto } from '../_lib/telegram'
import { getQueue, saveQueue } from '../_lib/store'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = assertCronAuth(req as unknown as Request)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const cfg = getTelegramConfig()
  if ('error' in cfg) {
    return res.status(200).json({ ok: false, skipped: true, reason: cfg.error })
  }

  const queue = await getQueue()
  if (!queue.length) {
    return res.status(200).json({ ok: true, processed: 0, note: 'empty queue or store not configured' })
  }

  const now = Date.now()
  let processed = 0
  const updated = [...queue]

  for (let i = 0; i < updated.length; i++) {
    const item = updated[i]
    if (item.status !== 'scheduled' || !item.scheduledAt) continue
    if (new Date(item.scheduledAt).getTime() > now) continue

    try {
      let result
      if (item.imageUrl) {
        result = await sendPhoto(cfg.token, cfg.channelId, item.imageUrl, item.text)
        if (!result.ok) result = await sendMessage(cfg.token, cfg.channelId, item.text)
      } else {
        result = await sendMessage(cfg.token, cfg.channelId, item.text)
      }

      if (result.ok) {
        const messageId = (result.result as { message_id?: number })?.message_id
        updated[i] = {
          ...item,
          status: 'published',
          stage: 'Published',
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
        }
        processed++
      } else {
        updated[i] = {
          ...item,
          status: 'failed',
          error: result.description || 'Telegram error',
        }
      }
    } catch (e) {
      updated[i] = {
        ...item,
        status: 'failed',
        error: e instanceof Error ? e.message : 'unknown',
      }
    }
  }

  await saveQueue(updated)
  return res.status(200).json({ ok: true, processed })
}
