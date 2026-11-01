export async function telegramApi(token: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return (await res.json()) as { ok: boolean; result?: unknown; description?: string }
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
