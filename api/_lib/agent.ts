/** NAMT AI Media Manager — draft generation (server-only). */

export type AgentDraft = {
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  imagePrompt?: string
}

export function getLlmConfig(): { apiKey: string; base: string; model: string } | null {
  const xai = process.env.XAI_API_KEY
  const openai = process.env.OPENAI_API_KEY
  if (xai) {
    return {
      apiKey: xai,
      base: 'https://api.x.ai/v1',
      model: process.env.XAI_MODEL || 'grok-beta',
    }
  }
  if (openai) {
    return {
      apiKey: openai,
      base: 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    }
  }
  return null
}

export async function generateAgentDraft(topicFocus: string, language: 'ru' | 'en'): Promise<AgentDraft> {
  const llm = getLlmConfig()
  if (!llm) {
    throw new Error('No OPENAI_API_KEY or XAI_API_KEY — autonomous writing unavailable')
  }

  const lang = language === 'ru' ? 'русском' : 'English'
  const prompt = `Ты — NAMT AI Media Manager, автономный редактор Telegram-канала про ИИ.
Фокус тем: ${topicFocus}

Задача: подготовь ОДИН готовый к публикации пост на ${lang}.

Правила оформления (Telegram HTML only — кастомных шрифтов в Telegram НЕТ):
- Структура: сильный заголовок в <b>, короткий лид, 2–4 абзаца, вывод, хештеги
- Без кликбейта и выдуманных цифр/цитат
- 900–1600 знаков
- Эмодзи умеренно (1–4), для ритма
- В конце 3–5 релевантных хештегов

Верни ТОЛЬКО JSON:
{
  "title": "короткий заголовок",
  "text": "полный HTML-текст поста для Telegram",
  "sources": ["источник или тема-основание"],
  "imagePrompt": "English prompt for a clean modern cover image, no text in image"
}`

  const res = await fetch(`${llm.base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${llm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: llm.model,
      messages: [
        { role: 'system', content: 'Autonomous AI media editor for NAMT. JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.75,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM ${res.status}: ${err.slice(0, 240)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

  let imageUrl: string | undefined
  if (process.env.OPENAI_API_KEY && process.env.ENABLE_IMAGE_GEN === 'true') {
    try {
      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: String(parsed.imagePrompt || 'Minimal modern AI abstract cover, no text'),
          size: '1024x1024',
          n: 1,
        }),
      })
      if (imgRes.ok) {
        const img = await imgRes.json()
        imageUrl = img.data?.[0]?.url
      }
    } catch {
      /* text-only */
    }
  }

  return {
    title: String(parsed.title || 'NAMT AI'),
    text: String(parsed.text || content),
    sources: Array.isArray(parsed.sources) ? parsed.sources.map(String) : [],
    imageUrl,
    imagePrompt: parsed.imagePrompt ? String(parsed.imagePrompt) : undefined,
  }
}

export async function publishDraft(
  token: string,
  channelId: string,
  draft: AgentDraft
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const { sendMessage, sendPhoto } = await import('./telegram')
  let result
  if (draft.imageUrl) {
    result = await sendPhoto(token, channelId, draft.imageUrl, draft.text)
    if (!result.ok) result = await sendMessage(token, channelId, draft.text)
  } else {
    result = await sendMessage(token, channelId, draft.text)
  }
  if (!result.ok) return { ok: false, error: result.description || 'Telegram reject' }
  const messageId = (result.result as { message_id?: number })?.message_id
  return { ok: true, messageId }
}
