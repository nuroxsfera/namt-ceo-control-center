import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMe, getChat } from '../_lib/telegram'
import { saveCredentials, hasServerStore, clearCredentials } from '../_lib/credentials'

/**
 * POST { botToken, channelId } — validate & store on server (Upstash).
 * DELETE — disconnect.
 * Token is never echoed back.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    if (!hasServerStore()) {
      return res.status(503).json({ error: 'Upstash Redis required to manage platform credentials' })
    }
    await clearCredentials()
    return res.status(200).json({ disconnected: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!hasServerStore()) {
    return res.status(503).json({
      error:
        'To connect a channel through the platform, configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel (free tier is enough). Token is stored server-side only.',
      requiresUpstash: true,
    })
  }

  const botToken = String(req.body?.botToken || '').trim()
  const channelId = String(req.body?.channelId || '').trim()

  if (!botToken || !channelId) {
    return res.status(400).json({ error: 'botToken and channelId are required' })
  }

  try {
    const me = await getMe(botToken)
    if (!me.ok) {
      return res.status(400).json({
        error: me.description || 'Invalid bot token (getMe failed)',
      })
    }
    const bot = me.result as { username?: string; first_name?: string }

    const chat = await getChat(botToken, channelId)
    if (!chat.ok) {
      return res.status(400).json({
        error:
          chat.description ||
          'Cannot access channel. Add the bot as channel admin with Post messages, then retry.',
      })
    }
    const ch = chat.result as { title?: string; username?: string }

    const saved = await saveCredentials({
      botToken,
      channelId,
      botUsername: bot.username,
      channelTitle: ch.title || ch.username,
      connectedAt: new Date().toISOString(),
    })

    if (!saved) {
      return res.status(503).json({ error: 'Failed to persist credentials' })
    }

    return res.status(200).json({
      connected: true,
      botUsername: bot.username,
      channelTitle: ch.title || ch.username,
      note: 'Token stored on server only. Autonomous mode can publish without CEO approval.',
    })
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Connect failed',
    })
  }
}
