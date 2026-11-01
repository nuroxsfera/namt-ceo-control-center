import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTelegramConfig, getMe, getChat } from '../_lib/telegram'
import { hasServerStore } from '../_lib/store'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const cfg = getTelegramConfig()
  if ('error' in cfg) {
    return res.status(200).json({
      connected: false,
      error: cfg.error,
      setupRequired: true,
      serverStore: hasServerStore(),
      hasAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.XAI_API_KEY),
    })
  }

  try {
    const me = await getMe(cfg.token)
    if (!me.ok) {
      return res.status(200).json({
        connected: false,
        error: me.description || 'getMe failed — check TELEGRAM_BOT_TOKEN',
        setupRequired: true,
        serverStore: hasServerStore(),
        hasAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.XAI_API_KEY),
      })
    }

    const chat = await getChat(cfg.token, cfg.channelId)
    const bot = me.result as { id: number; username?: string; first_name?: string }
    const chatInfo = chat.ok
      ? (chat.result as { id: number; title?: string; username?: string; type?: string })
      : null

    return res.status(200).json({
      connected: true,
      bot: {
        id: bot.id,
        username: bot.username,
        name: bot.first_name,
      },
      channel: chat.ok
        ? {
            id: chatInfo?.id,
            title: chatInfo?.title,
            username: chatInfo?.username,
            type: chatInfo?.type,
          }
        : {
            id: cfg.channelId,
            error: chat.description || 'Could not read channel. Is the bot an admin?',
          },
      serverStore: hasServerStore(),
      hasAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.XAI_API_KEY),
      capabilities: {
        sendMessage: true,
        sendPhoto: true,
        setChatPhoto: 'bot must be channel admin; may still fail depending on rights',
        setChatDescription: 'supported if bot is admin',
      },
    })
  } catch (e) {
    return res.status(500).json({
      connected: false,
      error: e instanceof Error ? e.message : 'Telegram status check failed',
      setupRequired: true,
    })
  }
}
