import type { VercelRequest, VercelResponse } from '@vercel/node'
import { resolveTelegramConfig } from '../_lib/credentials'
import { sendMessage, sendPhoto } from '../_lib/telegram'
import { getQueue, saveQueue, type ProductionItem } from '../_lib/store'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const cfg = await resolveTelegramConfig()
  if ('error' in cfg) return res.status(400).json({ error: cfg.error })

  const text = String(req.body?.text || '').trim()
  if (!text) return res.status(400).json({ error: 'text required' })
  const imageUrl = req.body?.imageUrl ? String(req.body.imageUrl) : undefined
  const title = req.body?.title ? String(req.body.title) : text.slice(0, 80)
  const clientId = String(req.body?.clientId || `pub_${Date.now()}`)

  try {
    let result
    if (imageUrl) {
      result = await sendPhoto(cfg.token, cfg.channelId, imageUrl, text)
      if (!result.ok) result = await sendMessage(cfg.token, cfg.channelId, text)
    } else {
      result = await sendMessage(cfg.token, cfg.channelId, text)
    }
    if (!result.ok) {
      return res.status(502).json({ published: false, error: result.description })
    }
    const messageId = (result.result as { message_id?: number })?.message_id

    const item: ProductionItem = {
      id: clientId,
      title,
      text,
      imageUrl,
      sources: Array.isArray(req.body?.sources) ? req.body.sources.map(String) : [],
      stage: 'Published',
      status: 'published',
      publishedAt: new Date().toISOString(),
      telegramMessageId: messageId,
      createdAt: new Date().toISOString(),
    }
    try {
      const q = await getQueue()
      q.unshift(item)
      await saveQueue(q.slice(0, 100))
    } catch { /* optional */ }

    return res.status(200).json({ published: true, telegramMessageId: messageId })
  } catch (e) {
    return res.status(500).json({
      published: false,
      error: e instanceof Error ? e.message : 'publish failed',
    })
  }
}
