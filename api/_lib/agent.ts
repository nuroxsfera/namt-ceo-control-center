/** NAMT AI Media Manager — text + required cover image. */

export type AgentDraft = {
  title: string
  text: string
  imageUrl?: string
  sources: string[]
  imagePrompt?: string
}

export function getLlmConfig(): { apiKey: string; base: string; model: string; provider: 'xai' | 'openai' } | null {
  const xai = process.env.XAI_API_KEY
  const openai = process.env.OPENAI_API_KEY
  // Prefer OpenAI when both set — needed for images
  if (openai) {
    return {
      apiKey: openai,
      base: 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: 'openai',
    }
  }
  if (xai) {
    return {
      apiKey: xai,
      base: 'https://api.x.ai/v1',
      model: process.env.XAI_MODEL || 'grok-beta',
      provider: 'xai',
    }
  }
  return null
}

async function generateCoverImage(imagePrompt: string): Promise<string> {
  const openai = process.env.OPENAI_API_KEY
  if (!openai) {
    throw new Error(
      'Для превью (обложки) нужен OPENAI_API_KEY в Vercel. Без него картинка к посту не создаётся.'
    )
  }

  const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openai}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      prompt: `${imagePrompt}. Clean modern editorial cover, high quality, no text, no watermark, no logos.`,
      size: '1024x1024',
      n: 1,
      quality: 'standard',
    }),
  })

  if (!imgRes.ok) {
    const err = await imgRes.text()
    throw new Error(`DALL·E error ${imgRes.status}: ${err.slice(0, 280)}`)
  }

  const img = await imgRes.json()
  const url = img.data?.[0]?.url
  if (!url) throw new Error('DALL·E returned empty image url')
  return url as string
}

export async function generateAgentDraft(topicFocus: string, language: 'ru' | 'en'): Promise<AgentDraft> {
  const llm = getLlmConfig()
  if (!llm) {
    throw new Error('Нужен OPENAI_API_KEY в Vercel (текст + превью).')
  }

  // Preview is mandatory → OpenAI key required for images even if text could use xAI
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'Превью 100%: укажите OPENAI_API_KEY в Vercel (DALL·E). XAI_API_KEY одного недостаточно для обложек.'
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
  "imagePrompt": "English: photoreal or clean 3D abstract AI cover, no text in image"
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
      'Modern abstract artificial intelligence neural network visualization, deep blue and teal, cinematic lighting, no text'
  )

  const imageUrl = await generateCoverImage(imagePrompt)

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

  if (!draft.imageUrl) {
    return { ok: false, error: 'Нет imageUrl — публикация без превью запрещена настройками платформы' }
  }

  const result = await sendPhoto(token, channelId, draft.imageUrl, draft.text)
  if (!result.ok) {
    // Telegram sometimes rejects external photo URL; try text-only only as last resort with error note
    return { ok: false, error: result.description || 'sendPhoto failed' }
  }
  const messageId = (result.result as { message_id?: number })?.message_id
  return { ok: true, messageId }
}
