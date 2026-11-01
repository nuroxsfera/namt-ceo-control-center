import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMe, getChat } from '../_lib/telegram'
import { resolveTelegramConfig, getSettings, hasServerStore } from '../_lib/credentials'
import { getLlmConfig } from '../_lib/agent'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const settings = await getSettings()
  const llm = getLlmConfig()
  const cfg = await resolveTelegramConfig()

  if ('error' in cfg) {
    return res.status(200).json({
      connected: false,
      error: cfg.error,
      setupRequired: true,
      serverStore: hasServerStore(),
      hasAiKey: Boolean(llm),
      autonomous: settings.autonomous,
      settings,
    })
  }

  try {
    const me = await getMe(cfg.token)
    if (!me.ok) {
      return res.status(200).json({
        connected: false,
        error: me.description || 'Bot token invalid',
        setupRequired: true,
        serverStore: hasServerStore(),
        hasAiKey: Boolean(llm),
        autonomous: settings.autonomous,
        source: cfg.source,
      })
    }
    const bot = me.result as { id: number; username?: string; first_name?: string }
    const chat = await getChat(cfg.token, cfg.channelId)
    const chatInfo = chat.ok
      ? (chat.result as { title?: string; username?: string; type?: string })
      : null

    return res.status(200).json({
      connected: true,
      source: cfg.source,
      bot: { id: bot.id, username: bot.username, name: bot.first_name },
      channel: chat.ok
        ? { title: chatInfo?.title, username: chatInfo?.username, type: chatInfo?.type }
        : { error: chat.description },
      serverStore: hasServerStore(),
      hasAiKey: Boolean(llm),
      autonomous: settings.autonomous,
      settings,
      telegramLimits: {
        customFonts: false,
        note: 'Telegram does not support custom fonts. Posts use HTML (<b>, <i>, lists via text).',
      },
    })
  } catch (e) {
    return res.status(500).json({
      connected: false,
      error: e instanceof Error ? e.message : 'status failed',
    })
  }
}
