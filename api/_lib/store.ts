/**
 * Lightweight server store for scheduled posts & production queue.
 * Prefers Upstash Redis REST if configured; otherwise returns null (caller must handle).
 */

export type ScheduledPost = {
  id: string
  text: string
  imageUrl?: string
  scheduledAt: string // ISO
  channelId: string
  status: 'scheduled' | 'published' | 'failed'
  createdAt: string
  sources?: string[]
  title?: string
}

export type ProductionItem = {
  id: string
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  stage: string
  status: 'pending_approval' | 'approved' | 'rejected' | 'revision' | 'scheduled' | 'published' | 'failed'
  scheduledAt?: string
  publishedAt?: string
  telegramMessageId?: string | number
  createdAt: string
  error?: string
}

const QUEUE_KEY = 'namt:media:queue'
const SCHEDULE_KEY = 'namt:media:scheduled'

function upstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url, token }
}

async function redisFetch(command: (string | number)[]) {
  const cfg = upstash()
  if (!cfg) return null
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.result
}

export function hasServerStore() {
  return Boolean(upstash())
}

export async function getQueue(): Promise<ProductionItem[]> {
  const raw = await redisFetch(['GET', QUEUE_KEY])
  if (!raw) return []
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw))
  } catch {
    return []
  }
}

export async function saveQueue(items: ProductionItem[]) {
  if (!upstash()) return false
  await redisFetch(['SET', QUEUE_KEY, JSON.stringify(items)])
  return true
}

export async function getScheduled(): Promise<ScheduledPost[]> {
  const raw = await redisFetch(['GET', SCHEDULE_KEY])
  if (!raw) return []
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw))
  } catch {
    return []
  }
}

export async function saveScheduled(items: ScheduledPost[]) {
  if (!upstash()) return false
  await redisFetch(['SET', SCHEDULE_KEY, JSON.stringify(items)])
  return true
}
