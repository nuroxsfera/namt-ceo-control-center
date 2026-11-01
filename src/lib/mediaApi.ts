export type TelegramStatus = {
  connected: boolean
  error?: string
  setupRequired?: boolean
  serverStore?: boolean
  hasAiKey?: boolean
  autonomous?: boolean
  source?: 'platform' | 'env'
  bot?: { id?: number; username?: string; name?: string }
  channel?: { title?: string; username?: string; type?: string; error?: string }
  settings?: {
    autonomous: boolean
    language: 'ru' | 'en'
    postsPerDay: number
    topicFocus: string
  }
  telegramLimits?: { customFonts: boolean; note: string }
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

export async function connectTelegram(botToken: string, channelId: string) {
  const res = await fetch('/api/telegram/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botToken, channelId }),
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export async function disconnectTelegram() {
  const res = await fetch('/api/telegram/connect', { method: 'DELETE' })
  return res.json()
}

export async function runAutonomousOnce() {
  const res = await fetch('/api/media/run-once', { method: 'POST' })
  const data = await res.json()
  return { ok: res.ok, data }
}

export async function saveMediaSettings(settings: Record<string, unknown>) {
  const res = await fetch('/api/media/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  return res.json()
}

export async function fetchServerQueue() {
  const res = await fetch('/api/media/queue')
  if (!res.ok) return { items: [] as MediaProductionItem[], serverStore: false }
  return res.json() as Promise<{ items: MediaProductionItem[]; serverStore: boolean }>
}
