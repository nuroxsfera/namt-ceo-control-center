/**
 * Server-only Telegram Bot API helpers.
 * Token must come from process.env — never from the client.
 */

export type TelegramConfig = {
  token: string
  channelId: string
}

export function getTelegramConfig(): TelegramConfig | { error: string } {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim()
  if (!token) {
    return { error: 'TELEGRAM_BOT_TOKEN is not set in Vercel environment variables.' }
  }
  if (!channelId) {
    return { error: 'TELEGRAM_CHANNEL_ID is not set (e.g. @your_channel or -100...).' }
  }
  return { token, channelId }
}

export async function telegramApi(token: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  return data as { ok: boolean; result?: unknown; description?: string }
}

export async function sendMessage(token: string, chatId: string, text: string) {
  return telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  })
}

export async function sendPhoto(token: string, chatId: string, photoUrl: string, caption: string) {
  return telegramApi(token, 'sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption.slice(0, 1024),
    parse_mode: 'HTML',
  })
}

export async function getMe(token: string) {
  return telegramApi(token, 'getMe')
}

export async function getChat(token: string, chatId: string) {
  return telegramApi(token, 'getChat', { chat_id: chatId })
}
