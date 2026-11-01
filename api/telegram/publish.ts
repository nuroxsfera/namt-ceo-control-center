import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTelegramConfig, sendMessage, sendPhoto } from '../_lib/telegram'
import { assertMediaWriteAuth } from '../_lib/auth'
import { getQueue, saveQueue, type ProductionItem } from '../_lib/store'

/**
 * POST { text, imageUrl?, title?, sources?, mode: 'now' | 'schedule', scheduledAt?, clientId? }
 * Only publishes when explicitly requested after CEO approval in the UI.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = assertMediaWriteAuth(req as unknown as Request)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const cfg = getTelegramConfig()
  if ('error' in cfg) {
    return res.status(400).json({ error: cfg.error, setupRequired: true })
  }

  const body = req.body || {}
  const text = String(body.text || '').trim()
  const imageUrl = body.imageUrl ? String(body.imageUrl) : undefined
  const mode = body.mode === 'schedule' ? 'schedule' : 'now'
  const scheduledAt = body.scheduledAt ? String(body.scheduledAt) : undefined
  const title = body.title ? String(body.title) : undefined
  const sources: string[] = Array.isArray(body.sources) ? body.sources.map(String) : []
  const clientId = body.clientId ? String(body.clientId) : `pub_${Date.now()}`

  if (!text) {
    return res.status(400).json({ error: 'text is required' })
  }

  if (mode === 'schedule') {
    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required for schedule mode' })
    }
    const item: ProductionItem = {
      id: clientId,
      title: title || text.slice(0, 80),
      text,
      imageUrl,
      sources,
      stage: 'Scheduling',
      status: 'scheduled',
      scheduledAt,
      createdAt: new Date().toISOString(),
    }
    const queue = await getQueue()
    queue.unshift(item)
    const saved = await saveQueue(queue)
    if (!saved) {
      return res.status(503).json({
        error:
          'Server store not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for scheduled publishing. Use mode "now" to publish immediately.',
        published: false,
        scheduled: false,
      })
    }
    return res.status(200).json({ published: false, scheduled: true, item })
  }

  // Publish now
  try {
    let result
    if (imageUrl) {
      result = await sendPhoto(cfg.token, cfg.channelId, imageUrl, text)
      // Fallback to text if photo URL rejected
      if (!result.ok) {
        result = await sendMessage(cfg.token, cfg.channelId, text)
      }
    } else {
      result = await sendMessage(cfg.token, cfg.channelId, text)
    }

    if (!result.ok) {
      return res.status(502).json({
        published: false,
        error: result.description || 'Telegram API rejected the message',
      })
    }

    const messageId = (result.result as { message_id?: number })?.message_id

    // Best-effort queue update
    try {
      const queue = await getQueue()
      const idx = queue.findIndex((q) => q.id === clientId)
      if (idx >= 0) {
        queue[idx] = {
          ...queue[idx],
          status: 'published',
          stage: 'Published',
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
        }
        await saveQueue(queue)
      } else {
        queue.unshift({
          id: clientId,
          title: title || text.slice(0, 80),
          text,
          imageUrl,
          sources,
          stage: 'Published',
          status: 'published',
          publishedAt: new Date().toISOString(),
          telegramMessageId: messageId,
          createdAt: new Date().toISOString(),
        })
        await saveQueue(queue)
      }
    } catch {
      /* optional store */
    }

    return res.status(200).json({
      published: true,
      scheduled: false,
      telegramMessageId: messageId,
      channelId: cfg.channelId,
    })
  } catch (e) {
    return res.status(500).json({
      published: false,
      error: e instanceof Error ? e.message : 'Publish failed',
    })
  }
}
