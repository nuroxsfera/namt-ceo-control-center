/** Client helpers for NAMT Media server API. Secrets never stored here. */

export type TelegramStatus = {
  connected: boolean
  error?: string
  setupRequired?: boolean
  serverStore?: boolean
  hasAiKey?: boolean
  bot?: { id: number; username?: string; name?: string }
  channel?: { id?: number | string; title?: string; username?: string; type?: string; error?: string }
  capabilities?: Record<string, string | boolean>
}

export type MediaProductionItem = {
  id: string
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  stage: string
  status: string
  scheduledAt?: string
  publishedAt?: string
  telegramMessageId?: string | number
  createdAt: string
  error?: string
}

export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const res = await fetch('/api/telegram/status')
  return res.json()
}

export async function publishToTelegram(payload: {
  text: string
  imageUrl?: string
  title?: string
  sources?: string[]
  mode: 'now' | 'schedule'
  scheduledAt?: string
  clientId?: string
}) {
  const res = await fetch('/api/telegram/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export async function generateMediaDraft(topic?: string) {
  const res = await fetch('/api/media/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export async function fetchServerQueue() {
  const res = await fetch('/api/media/queue')
  return res.json() as Promise<{ items: MediaProductionItem[]; serverStore: boolean; note?: string }>
}
