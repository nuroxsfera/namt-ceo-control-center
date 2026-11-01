import type { VercelRequest, VercelResponse } from '@vercel/node'
import { resolveTelegramConfig, getSettings } from '../_lib/credentials'
import { generateAgentDraft, publishDraft } from '../_lib/agent'
import { getQueue, saveQueue, type ProductionItem } from '../_lib/store'

/**
 * Manual or cron trigger: generate + publish immediately (autonomous, no CEO approval).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const settings = await getSettings()
  if (!settings.autonomous && req.method === 'GET') {
    // cron respects autonomous flag
    return res.status(200).json({ skipped: true, reason: 'autonomous mode off' })
  }

  const cfg = await resolveTelegramConfig()
  if ('error' in cfg) {
    return res.status(400).json({ ok: false, error: cfg.error })
  }

  try {
    const draft = await generateAgentDraft(settings.topicFocus, settings.language)
    const pub = await publishDraft(cfg.token, cfg.channelId, draft)

    const item: ProductionItem = {
      id: `auto_${Date.now()}`,
      title: draft.title,
      text: draft.text,
      imageUrl: draft.imageUrl,
      sources: draft.sources,
      stage: pub.ok ? 'Published' : 'Failed',
      status: pub.ok ? 'published' : 'failed',
      publishedAt: pub.ok ? new Date().toISOString() : undefined,
      telegramMessageId: pub.messageId,
      createdAt: new Date().toISOString(),
      error: pub.error,
    }

    try {
      const q = await getQueue()
      q.unshift(item)
      await saveQueue(q.slice(0, 100))
    } catch { /* optional */ }

    if (!pub.ok) {
      return res.status(502).json({ ok: false, error: pub.error, draft: { title: draft.title } })
    }

    return res.status(200).json({
      ok: true,
      published: true,
      title: draft.title,
      telegramMessageId: pub.messageId,
      hadImage: Boolean(draft.imageUrl),
    })
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e instanceof Error ? e.message : 'run-once failed',
    })
  }
}
