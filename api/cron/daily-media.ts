import type { VercelRequest, VercelResponse } from '@vercel/node'
import { assertCronAuth } from '../_lib/auth'
import { getQueue, saveQueue, hasServerStore, type ProductionItem } from '../_lib/store'

/**
 * Morning job: if AI key is present, generate a draft into the approval queue.
 * Never publishes without CEO approval.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = assertCronAuth(req as unknown as Request)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  if (!hasServerStore()) {
    return res.status(200).json({
      ok: false,
      skipped: true,
      reason: 'UPSTASH Redis not configured — cannot persist daily drafts server-side',
    })
  }

  const aiKey = process.env.OPENAI_API_KEY || process.env.XAI_API_KEY
  if (!aiKey) {
    return res.status(200).json({
      ok: false,
      skipped: true,
      reason: 'No OPENAI_API_KEY or XAI_API_KEY — cannot auto-generate drafts',
    })
  }

  // Call internal generate logic inline to avoid HTTP self-call issues
  try {
    const draft = await generateDraft(aiKey)
    const item: ProductionItem = {
      id: `auto_${Date.now()}`,
      title: draft.title,
      text: draft.text,
      imageUrl: draft.imageUrl,
      sources: draft.sources,
      stage: 'CEO Approval',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    }
    const queue = await getQueue()
    queue.unshift(item)
    await saveQueue(queue)
    return res.status(200).json({ ok: true, draftId: item.id, title: item.title })
  } catch (e) {
    return res.status(200).json({
      ok: false,
      error: e instanceof Error ? e.message : 'daily generation failed',
    })
  }
}

async function generateDraft(apiKey: string): Promise<{
  title: string
  text: string
  imageUrl?: string
  sources: string[]
}> {
  const useXai = Boolean(process.env.XAI_API_KEY) && apiKey === process.env.XAI_API_KEY
  const base = useXai ? 'https://api.x.ai/v1' : 'https://api.openai.com/v1'
  const model = useXai ? 'grok-beta' : 'gpt-4o-mini'

  const prompt = `Ты — NAMT AI Media Manager. Подготовь ОДИН пост на русском для Telegram-канала про ИИ.
Требования: оригинал, без кликбейта, 800–1200 знаков, HTML-форматирование Telegram (<b>, <i>), в конце 3–5 хештегов.
Верни JSON: { "title": "...", "text": "...", "sources": ["url или название источника"] }`

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a careful AI media editor. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM error: ${res.status} ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
  return {
    title: String(parsed.title || 'AI digest'),
    text: String(parsed.text || content),
    sources: Array.isArray(parsed.sources) ? parsed.sources.map(String) : [],
  }
}
