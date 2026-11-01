/** NAMT AI Media Manager — text (xAI/OpenAI) + free cover (Pollinations). */

export type AgentDraft = {
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  imagePrompt?: string
}

export function getLlmConfig(): {
  apiKey: string
  base: string
  model: string
  provider: 'xai' | 'openai'
} | null {
  const xai = process.env.XAI_API_KEY?.trim()
  const openai = process.env.OPENAI_API_KEY?.trim()

  if (xai) {
    return {
      apiKey: xai,
      base: 'https://api.x.ai/v1',
      model: process.env.XAI_MODEL || 'grok-2-latest',
      provider: 'xai',
    }
  }
  if (openai) {
    return {
      apiKey: openai,
      base: 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: 'openai',
    }
  }
  return null
}

/** Free cover image — no API key. Telegram can fetch this URL in sendPhoto. */
export function freeCoverUrl(imagePrompt: string): string {
  const prompt = `${imagePrompt}. editorial cover, modern AI technology, cinematic lighting, no text, no watermark`
  const encoded = encodeURIComponent(prompt.slice(0, 400))
  // cache-bust so each post gets a fresh render
  const seed = Date.now() % 1_000_000
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`
}

async function optionalOpenAiCover(imagePrompt: string): Promise<string | null> {
  const openai = process.env.OPENAI_API_KEY?.trim()
  if (!openai || process.env.ENABLE_IMAGE_GEN !== 'true') return null
  try {
    const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
        prompt: `${imagePrompt}. Clean cover, no text, no watermark.`,
        size: '1024x1024',
        n: 1,
      }),
    })
    if (!imgRes.ok) return null
    const img = await imgRes.json()
    return (img.data?.[0]?.url as string) || null
  } catch {
    return null
  }
}

export async function generateAgentDraft(topicFocus: string, language: 'ru' | 'en'): Promise<AgentDraft> {
  const llm = getLlmConfig()
  if (!llm) {
    throw new Error(
      'Нужен ключ для текста: XAI_API_KEY (Grok API) или OPENAI_API_KEY в Vercel. Сам Grok-чат в браузере к серверу не подключается.'
    )
  }

  const lang = language === 'ru' ? 'русском' : 'English'
  const prompt = `Ты — NAMT AI Media Manager, автономный редактор Telegram-канала про ИИ.
Фокус тем: ${topicFocus}

Подготовь ОДИН готовый пост на ${lang}.

Оформление Telegram HTML (кастомных шрифтов нет):
- <b>заголовок</b>, лид, 2–4 абзаца, вывод, 3–5 хештегов
- 900–1600 знаков, без выдуманных цифр

Верни ТОЛЬКО JSON:
{
  "title": "...",
  "text": "полный HTML-текст",
  "sources": ["..."],
  "imagePrompt": "English: photoreal or clean abstract AI cover, no text in image"
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
        { role: 'system', content: 'NAMT media editor. JSON only.' },
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

  const imagePrompt = String(
    parsed.imagePrompt ||
      'Modern abstract artificial intelligence neural network, deep blue and teal, cinematic, no text'
  )

  // Prefer free cover so preview is always present without paid DALL·E
  const paid = await optionalOpenAiCover(imagePrompt)
  const imageUrl = paid || freeCoverUrl(imagePrompt)

  return {
    title: String(parsed.title || 'NAMT AI'),
    text: String(parsed.text || content),
    sources: Array.isArray(parsed.sources) ? parsed.sources.map(String) : [],
    imageUrl,
    imagePrompt,
  }
}

export async function publishDraft(
  token: string,
  channelId: string,
  draft: AgentDraft
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const { sendMessage, sendPhoto } = await import('./telegram')

  if (draft.imageUrl) {
    const photo = await sendPhoto(token, channelId, draft.imageUrl, draft.text)
    if (photo.ok) {
      const messageId = (photo.result as { message_id?: number })?.message_id
      return { ok: true, messageId }
    }
    // fallback text if photo URL rejected by Telegram
    const textOnly = await sendMessage(
      token,
      channelId,
      `${draft.text}\n\n<i>cover: ${draft.imageUrl}</i>`
    )
    if (textOnly.ok) {
      const messageId = (textOnly.result as { message_id?: number })?.message_id
      return { ok: true, messageId }
    }
    return { ok: false, error: photo.description || textOnly.description || 'publish failed' }
  }

  const result = await sendMessage(token, channelId, draft.text)
  if (!result.ok) return { ok: false, error: result.description || 'sendMessage failed' }
  const messageId = (result.result as { message_id?: number })?.message_id
  return { ok: true, messageId }
}
