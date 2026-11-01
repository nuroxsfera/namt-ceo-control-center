import { useCallback, useEffect, useState } from 'react'
import {
  fetchTelegramStatus,
  connectTelegram,
  disconnectTelegram,
  runAutonomousOnce,
  saveMediaSettings,
  fetchServerQueue,
  type TelegramStatus,
  type MediaProductionItem,
} from '../lib/mediaApi'
import {
  Radio, Bot, CheckCircle2, XCircle, RefreshCw, Sparkles, AlertTriangle,
  Zap, Power, Eye,
} from 'lucide-react'
import { cn } from '../lib/utils'

type Tab = 'overview' | 'channels' | 'agent' | 'log' | 'settings'

export function Media() {
  const [tab, setTab] = useState<Tab>('overview')
  const [status, setStatus] = useState<TelegramStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [log, setLog] = useState<MediaProductionItem[]>([])

  // Connect form — token only in memory until submit; never written to localStorage
  const [botToken, setBotToken] = useState('')
  const [channelId, setChannelId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [running, setRunning] = useState(false)

  const [topicFocus, setTopicFocus] = useState('искусственный интеллект, нейросети, AI-агенты')
  const [autonomous, setAutonomous] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const s = await fetchTelegramStatus()
      setStatus(s)
      if (s.settings) {
        setAutonomous(s.settings.autonomous)
        setTopicFocus(s.settings.topicFocus || topicFocus)
      }
      const q = await fetchServerQueue()
      if (q.items?.length) setLog(q.items)
    } catch {
      setStatus({ connected: false, error: 'Cannot reach API', setupRequired: true })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleConnect = async () => {
    setMsg(null)
    setConnecting(true)
    try {
      const { ok, data } = await connectTelegram(botToken.trim(), channelId.trim())
      if (!ok) {
        setMsg(data.error || 'Connect failed')
        return
      }
      setBotToken('') // clear from browser memory after success
      setMsg(`Канал подключён: ${data.channelTitle || channelId} · бот @${data.botUsername || '—'}`)
      await refresh()
      setTab('overview')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Network error')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Отключить Telegram-канал от платформы?')) return
    await disconnectTelegram()
    setMsg('Канал отключён')
    await refresh()
  }

  const handleRunOnce = async () => {
    setMsg(null)
    setRunning(true)
    try {
      const { ok, data } = await runAutonomousOnce()
      if (!ok || !data.ok) {
        setMsg(data.error || 'Autonomous run failed')
        return
      }
      setMsg(`Опубликовано: «${data.title}» · msg ${data.telegramMessageId}`)
      await refresh()
      setTab('log')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Network error')
    } finally {
      setRunning(false)
    }
  }

  const handleSaveSettings = async () => {
    await saveMediaSettings({ autonomous, topicFocus, language: 'ru' })
    setMsg('Настройки сохранены')
    await refresh()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'channels', label: 'Каналы' },
    { id: 'agent', label: 'AI Media Manager' },
    { id: 'log', label: 'Лента публикаций' },
    { id: 'settings', label: 'Настройки' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">NAMT Media</h1>
          <p className="text-slate-500 mt-1">
            Автопилот Telegram · без ручного одобрения постов
          </p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm" disabled={loading}>
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Обновить
        </button>
      </div>

      {msg && (
        <div className="card p-3 text-sm bg-namt-50 border-namt-200 text-namt-900 flex gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Status bar */}
      <div
        className={cn(
          'card p-4 flex flex-col sm:flex-row sm:items-center gap-3',
          status?.connected ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
        )}
      >
        <div className="flex items-center gap-2">
          {status?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">
              {status?.connected
                ? `Подключено: @${status.bot?.username || 'bot'} → ${status.channel?.title || status.channel?.username || 'канал'}`
                : 'Канал не подключён'}
            </p>
            <p className="text-xs text-slate-600">
              {status?.connected
                ? `Источник: ${status.source === 'platform' ? 'платформа' : 'env'} · Автопилот: ${status.autonomous ? 'ВКЛ' : 'ВЫКЛ'}`
                : status?.error || 'Добавьте бота во вкладке Каналы'}
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2 text-xs">
          <span className="badge bg-white border">AI: {status?.hasAiKey ? 'ключ есть' : 'нет ключа'}</span>
          <span className="badge bg-white border">Store: {status?.serverStore ? 'Upstash' : 'нужен Upstash'}</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap',
              tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Telegram" value={status?.connected ? 'ON' : 'OFF'} />
            <Card label="Автопилот" value={status?.autonomous ? 'ON' : 'OFF'} />
            <Card label="Публикаций" value={log.filter((l) => l.status === 'published').length} />
            <Card label="Ошибок" value={log.filter((l) => l.status === 'failed').length} />
          </div>
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Как это работает для вас
            </h2>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Подключаете канал один раз (токен бота + канал) — прямо в платформе.</li>
              <li>Агент сам пишет посты, оформляет HTML, по возможности делает обложку.</li>
              <li>Сам публикует в Telegram по расписанию cron (утро / день / вечер UTC).</li>
              <li>Вы просто заходите в канал и читаете — одобрять каждый пост не нужно.</li>
            </ol>
            <p className="text-xs text-slate-500">
              Важно: в Telegram <b>нельзя</b> задать произвольный шрифт. Оформление — структура, &lt;b&gt;/&lt;i&gt;, абзацы, эмодзи, обложка.
            </p>
            {status?.connected && status?.hasAiKey && (
              <button className="btn-primary" onClick={handleRunOnce} disabled={running}>
                <Sparkles className="w-4 h-4" />
                {running ? 'Публикую…' : 'Сгенерировать и выложить сейчас'}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'channels' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-namt-600" />
              <h2 className="font-semibold">Добавить Telegram-канал</h2>
            </div>

            {!status?.serverStore && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                Для хранения токена на сервере нужны переменные Upstash в Vercel (бесплатно):
                <code className="block mt-1 text-xs">UPSTASH_REDIS_REST_URL</code>
                <code className="block text-xs">UPSTASH_REDIS_REST_TOKEN</code>
                Без них платформа не сможет безопасно запомнить токен между запросами.
              </div>
            )}

            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Telegram → <b>@BotFather</b> → /newbot → скопируйте token</li>
              <li>Создайте канал NAMT AI</li>
              <li>Добавьте бота админом канала с правом <b>Post messages</b></li>
              <li>Вставьте token и @канал ниже → Подключить</li>
            </ol>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Bot token (только на сервер, не в GitHub)</label>
                <input
                  type="password"
                  className="input font-mono text-sm"
                  placeholder="123456:ABC-DEF..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Channel ID</label>
                <input
                  className="input"
                  placeholder="@namt_ai или -100..."
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary"
                  disabled={connecting || !botToken || !channelId || !status?.serverStore}
                  onClick={handleConnect}
                >
                  {connecting ? 'Проверяю…' : 'Подключить канал'}
                </button>
                {status?.connected && (
                  <button className="btn-ghost text-rose-600" onClick={handleDisconnect}>
                    <Power className="w-4 h-4" /> Отключить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'agent' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">NAMT AI Media Manager</h2>
              <p className="text-sm text-slate-500">Автономный режим: пишет → оформляет → публикует</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {status?.hasAiKey
              ? 'LLM-ключ на сервере найден. Агент может писать посты сам.'
              : 'Нужен OPENAI_API_KEY или XAI_API_KEY в Vercel — без ключа агент не пишет (мы не рисуем фейковые посты).'}
          </p>
          <div>
            <label className="text-xs text-slate-500">Фокус тем</label>
            <input className="input" value={topicFocus} onChange={(e) => setTopicFocus(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autonomous} onChange={(e) => setAutonomous(e.target.checked)} />
            Автопилот включён (cron публикует без вашего клика)
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={handleSaveSettings}>Сохранить</button>
            <button
              className="btn-primary"
              disabled={!status?.connected || !status?.hasAiKey || running}
              onClick={handleRunOnce}
            >
              <Sparkles className="w-4 h-4" />
              {running ? 'Работаю…' : 'Выложить пост сейчас'}
            </button>
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="space-y-3">
          {log.length === 0 && (
            <div className="card p-8 text-center text-slate-500">Пока нет серверных публикаций</div>
          )}
          {log.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.publishedAt || item.createdAt}
                    {item.telegramMessageId != null && ` · msg ${item.telegramMessageId}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'badge text-[10px]',
                    item.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-3 whitespace-pre-wrap">{item.text}</p>
              {item.error && <p className="text-xs text-rose-600 mt-1">{item.error}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="card p-5 space-y-3 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-900">Серверные переменные (Vercel)</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><b>UPSTASH_REDIS_REST_URL + TOKEN</b> — обязательно для «Подключить канал» в UI</li>
            <li><b>OPENAI_API_KEY</b> или <b>XAI_API_KEY</b> — тексты агента</li>
            <li><b>ENABLE_IMAGE_GEN=true</b> + OpenAI — обложки DALL·E</li>
            <li>Cron: 07:00 / 12:00 / 16:00 UTC — автопосты</li>
          </ul>
          <p className="text-xs text-slate-500 flex items-start gap-1">
            <Eye className="w-3.5 h-3.5 mt-0.5" />
            Токен бота после «Подключить» хранится только на сервере (Upstash), не в репозитории и не в localStorage.
          </p>
        </div>
      )}
    </div>
  )
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  )
}
