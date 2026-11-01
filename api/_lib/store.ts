/**
 * Upstash Redis REST helpers + media queue types.
 */

export type ProductionItem = {
  id: string
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  stage: string
  status: 'draft' | 'queued' | 'published' | 'failed'
  scheduledAt?: string
  publishedAt?: string
  telegramMessageId?: string | number
  createdAt: string
  error?: string
}

const QUEUE_KEY = 'namt:media:queue'

function upstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url, token }
}

export function hasServerStore() {
  return Boolean(upstash())
}

export async function redisFetch(command: (string | number)[]): Promise<unknown | null> {
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

export async function redisGet(key: string): Promise<unknown | null> {
  return redisFetch(['GET', key])
}

export async function redisSet(key: string, value: string): Promise<boolean> {
  if (!upstash()) return false
  await redisFetch(['SET', key, value])
  return true
}

export async function getQueue(): Promise<ProductionItem[]> {
  const raw = await redisGet(QUEUE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw))
  } catch {
    return []
  }
}

export async function saveQueue(items: ProductionItem[]): Promise<boolean> {
  return redisSet(QUEUE_KEY, JSON.stringify(items))
}
