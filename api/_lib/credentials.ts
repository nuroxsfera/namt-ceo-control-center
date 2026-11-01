/**
 * Server-side channel credentials.
 * Token is never returned to the client after save.
 */
import { redisGet, redisSet, hasServerStore } from './store'

const CREDS_KEY = 'namt:telegram:credentials'
const SETTINGS_KEY = 'namt:media:settings'

export type TelegramCredentials = {
  botToken: string
  channelId: string
  botUsername?: string
  channelTitle?: string
  connectedAt: string
}

export type MediaSettings = {
  autonomous: boolean
  language: 'ru' | 'en'
  postsPerDay: number
  preferredHoursUtc: number[]
  topicFocus: string
}

const defaultSettings: MediaSettings = {
  autonomous: true,
  language: 'ru',
  postsPerDay: 1,
  preferredHoursUtc: [7, 12, 16],
  topicFocus: 'искусственный интеллект, нейросети, AI-бизнес, агенты',
}

export { hasServerStore }

export async function saveCredentials(creds: TelegramCredentials): Promise<boolean> {
  return redisSet(CREDS_KEY, JSON.stringify(creds))
}

export async function getCredentials(): Promise<TelegramCredentials | null> {
  const raw = await redisGet(CREDS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw))
  } catch {
    return null
  }
}

export async function clearCredentials(): Promise<boolean> {
  return redisSet(CREDS_KEY, '')
}

export async function getSettings(): Promise<MediaSettings> {
  const raw = await redisGet(SETTINGS_KEY)
  if (!raw) return { ...defaultSettings }
  try {
    return { ...defaultSettings, ...JSON.parse(typeof raw === 'string' ? raw : String(raw)) }
  } catch {
    return { ...defaultSettings }
  }
}

export async function saveSettings(s: Partial<MediaSettings>): Promise<MediaSettings> {
  const cur = await getSettings()
  const next = { ...cur, ...s }
  await redisSet(SETTINGS_KEY, JSON.stringify(next))
  return next
}

/** Resolve token: platform-stored creds first, then env fallback. */
export async function resolveTelegramConfig(): Promise<
  | { token: string; channelId: string; source: 'platform' | 'env'; meta?: Partial<TelegramCredentials> }
  | { error: string }
> {
  const stored = await getCredentials()
  if (stored?.botToken && stored?.channelId) {
    return {
      token: stored.botToken,
      channelId: stored.channelId,
      source: 'platform',
      meta: {
        botUsername: stored.botUsername,
        channelTitle: stored.channelTitle,
        connectedAt: stored.connectedAt,
      },
    }
  }
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim()
  if (token && channelId) {
    return { token, channelId, source: 'env' }
  }
  return {
    error:
      'Telegram not connected. Add bot token and channel in Media → Channels, or set TELEGRAM_* env vars. Server store (Upstash) is required for platform connect.',
  }
}
