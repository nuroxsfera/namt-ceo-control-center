import type { VercelRequest, VercelResponse } from '@vercel/node'
import { assertCronAuth } from '../_lib/auth'

/** Autonomous morning publish — delegates to run-once logic via internal import path pattern. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = assertCronAuth(req as unknown as Request)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  // Reuse run-once by dynamic import of shared agent path
  const { resolveTelegramConfig, getSettings } = await import('../_lib/credentials')
  const { generateAgentDraft, publishDraft } = await import('../_lib/agent')
  const { getQueue, saveQueue } = await import('../_lib/store')

  const settings = await getSettings()
  if (!settings.autonomous) {
    return res.status(200).json({ skipped: true, reason: 'autonomous off' })
  }

  const cfg = await resolveTelegramConfig()
  if ('error' in cfg) {
    return res.status(200).json({ ok: false, error: cfg.error })
  }

  try {
    const draft = await generateAgentDraft(settings.topicFocus, settings.language)
    const pub = await publishDraft(cfg.token, cfg.channelId, draft)
    const item = {
      id: `cron_${Date.now()}`,
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
    } as const
    try {
      const q = await getQueue()
      q.unshift(item as any)
      await saveQueue(q.slice(0, 100) as any)
    } catch { /* */ }

    return res.status(200).json({
      ok: pub.ok,
      published: pub.ok,
      title: draft.title,
      telegramMessageId: pub.messageId,
      error: pub.error,
    })
  } catch (e) {
    return res.status(200).json({
      ok: false,
      error: e instanceof Error ? e.message : 'cron failed',
    })
  }
}
