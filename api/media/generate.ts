import type { VercelRequest, VercelResponse } from '@vercel/node'
import { assertMediaWriteAuth } from '../_lib/auth'
import { getQueue, saveQueue, hasServerStore, type ProductionItem } from '../_lib/store'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = assertMediaWriteAuth(req as unknown as Request)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const openai = process.env.OPENAI_API_KEY
  const xai = process.env.XAI_API_KEY
  const apiKey = xai || openai
  if (!apiKey) {
    return res.status(400).json({
      error:
        'AI generation requires OPENAI_API_KEY or XAI_API_KEY in Vercel environment variables. No draft was fabricated.',
      requiresKey: true,
    })
  }

  const useXai = Boolean(xai)
  const base = useXai ? 'https://api.x.ai/v1' : 'https://api.openai.com/v1'
  const model = useXai ? (process.env.XAI_MODEL || 'grok-beta') : (process.env.OPENAI_MODEL || 'gpt-4o-mini')
  const topic = req.body?.topic ? String(req.body.topic) : 'актуальные тенденции искусственного интеллекта'

  try {
    const prompt = `Ты — NAMT AI Media Manager корпоративного канала про ИИ.
Тема/фокус: ${topic}

Сделай:
1) Выбери одну конкретную тему
2) Кратко проверь, что это правдоподобно (не выдумывай цифры)
3) Напиши оригинальный пост на русском для Telegram (800–1500 знаков)
4) Используй HTML: <b>, <i>
5) Добавь 3–5 хештегов

Верни ТОЛЬКО JSON:
{ "title": "...", "text": "полный текст поста", "sources": ["..."], "imagePrompt": "english prompt for cover image" }`

    const llmRes = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Careful AI media editor. JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!llmRes.ok) {
      const err = await llmRes.text()
      return res.status(502).json({ error: `LLM request failed: ${llmRes.status}`, detail: err.slice(0, 300) })
    }

    const data = await llmRes.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

    let imageUrl: string | undefined
    // Optional image via OpenAI images API only (xAI path skips unless configured)
    if (openai && process.env.ENABLE_IMAGE_GEN === 'true') {
      try {
        const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openai}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: String(parsed.imagePrompt || parsed.title || 'AI technology abstract'),
            size: '1024x1024',
            n: 1,
          }),
        })
        if (imgRes.ok) {
          const imgData = await imgRes.json()
          imageUrl = imgData.data?.[0]?.url
        }
      } catch {
        /* text-only fallback */
      }
    }

    const item: ProductionItem = {
      id: `gen_${Date.now()}`,
      title: String(parsed.title || 'Draft'),
      text: String(parsed.text || ''),
      imageUrl,
      sources: Array.isArray(parsed.sources) ? parsed.sources.map(String) : [],
      stage: 'CEO Approval',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    }

    if (hasServerStore()) {
      const queue = await getQueue()
      queue.unshift(item)
      await saveQueue(queue)
    }

    return res.status(200).json({
      ok: true,
      item,
      persisted: hasServerStore(),
      imageGenerated: Boolean(imageUrl),
      note: imageUrl
        ? undefined
        : 'Image not generated (set ENABLE_IMAGE_GEN=true and OPENAI_API_KEY for DALL·E). Text draft is ready for CEO approval.',
    })
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Generation failed',
    })
  }
}
