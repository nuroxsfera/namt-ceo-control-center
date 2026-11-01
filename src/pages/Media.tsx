import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import {
  fetchTelegramStatus,
  publishToTelegram,
  generateMediaDraft,
  fetchServerQueue,
  type TelegramStatus,
  type MediaProductionItem,
} from '../lib/mediaApi'
import {
  Radio, Bot, CheckCircle2, XCircle, Clock, RefreshCw, Send, Calendar,
  Sparkles, AlertTriangle, ExternalLink, Image as ImageIcon, FileText,
} from 'lucide-react'
import { cn } from '../lib/utils'

type MediaTab =
  | 'dashboard'
  | 'agent'
  | 'channels'
  | 'production'
  | 'approval'
  | 'calendar'
  | 'published'
  | 'settings'

const TABS: { id: MediaTab; labelRu: string; labelEn: string }[] = [
  { id: 'dashboard', labelRu: 'Dashboard', labelEn: 'Dashboard' },
  { id: 'agent', labelRu: 'AI Media Manager', labelEn: 'AI Media Manager' },
  { id: 'channels', labelRu: 'Channels', labelEn: 'Channels' },
  { id: 'production', labelRu: 'Production', labelEn: 'Production' },
  { id: 'approval', labelRu: 'Approval Queue', labelEn: 'Approval Queue' },
  { id: 'calendar', labelRu: 'Calendar', labelEn: 'Calendar' },
  { id: 'published', labelRu: 'Published', labelEn: 'Published' },
  { id: 'settings', labelRu: 'Settings', labelEn: 'Settings' },
]

type LocalDraft = MediaProductionItem

export function Media() {
  const { language } = useTranslation()
  const [tab, setTab] = useState<MediaTab>('dashboard')
  const [status, setStatus] = useState<TelegramStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [drafts, setDrafts] = useState<LocalDraft[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [topic, setTopic] = useState('тренды ИИ')
  const [manualText, setManualText] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [scheduleAt, setScheduleAt] = useState('')

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true)
    try {
      const s = await fetchTelegramStatus()
      setStatus(s)
    } catch {
      setStatus({ connected: false, error: 'Failed to reach /api/telegram/status', setupRequired: true })
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    try {
      const q = await fetchServerQueue()
      if (q.items?.length) {
        setDrafts((prev) => {
          const map = new Map<string, LocalDraft>()
          ;[...q.items, ...prev].forEach((i) => map.set(i.id, i))
          return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        })
      }
    } catch {
      /* client-only mode */
    }
  }, [])

  useEffect(() => {
    loadStatus()
    loadQueue()
  }, [loadStatus, loadQueue])

  const pending = drafts.filter((d) => d.status === 'pending_approval' || d.status === 'revision')
  const scheduled = drafts.filter((d) => d.status === 'scheduled')
  const published = drafts.filter((d) => d.status === 'published')

  const addLocalDraft = (item: LocalDraft) => {
    setDrafts((prev) => [item, ...prev.filter((p) => p.id !== item.id)])
  }

  const handleGenerate = async () => {
    setMessage(null)
    setBusyId('generate')
    try {
      const { ok, data } = await generateMediaDraft(topic)
      if (!ok) {
        setMessage(data.error || 'Generation failed')
        return
      }
      if (data.item) {
        addLocalDraft(data.item)
        setMessage(
          data.imageGenerated
            ? 'Draft + image ready → Approval Queue'
            : data.note || 'Text draft ready → Approval Queue (no image)'
        )
        setTab('approval')
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  const handleManualEnqueue = () => {
    if (!manualText.trim()) return
    const item: LocalDraft = {
      id: `manual_${Date.now()}`,
      title: manualTitle || manualText.slice(0, 60),
      text: manualText,
      sources: [],
      stage: 'CEO Approval',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    }
    addLocalDraft(item)
    setManualText('')
    setManualTitle('')
    setTab('approval')
    setMessage('Manual draft added to Approval Queue')
  }

  const handleApprove = async (item: LocalDraft, mode: 'now' | 'schedule') => {
    setBusyId(item.id)
    setMessage(null)
    try {
      const { ok, data } = await publishToTelegram({
        text: item.text,
        imageUrl: item.imageUrl,
        title: item.title,
        sources: item.sources,
        mode,
        scheduledAt: mode === 'schedule' ? scheduleAt || item.scheduledAt : undefined,
        clientId: item.id,
      })
      if (!ok || data.error) {
        setMessage(data.error || 'Publish failed')
        addLocalDraft({ ...item, status: 'failed', error: data.error })
        return
      }
      if (data.published) {
        addLocalDraft({
          ...item,
          status: 'published',
          stage: 'Published',
          publishedAt: new Date().toISOString(),
          telegramMessageId: data.telegramMessageId,
        })
        setMessage('Published to Telegram successfully')
      } else if (data.scheduled) {
        addLocalDraft({
          ...item,
          status: 'scheduled',
          stage: 'Scheduling',
          scheduledAt: scheduleAt || item.scheduledAt,
        })
        setMessage('Scheduled on server — cron will publish at the set time')
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = (item: LocalDraft, revision: boolean) => {
    addLocalDraft({
      ...item,
      status: revision ? 'revision' : 'rejected',
      stage: revision ? 'Request Revision' : 'Rejected',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">NAMT Media</h1>
          <p className="text-slate-500 mt-1">
            Telegram autonomous pipeline · CEO approval required before publish
          </p>
        </div>
        <button onClick={() => { loadStatus(); loadQueue() }} className="btn-secondary text-sm" disabled={loadingStatus}>
          <RefreshCw className={cn('w-4 h-4', loadingStatus && 'animate-spin')} /> Refresh
        </button>
      </div>

      {message && (
        <div className="card p-3 text-sm border-namt-200 bg-namt-50 text-namt-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Connection strip */}
      <div className={cn(
        'card p-4 flex flex-col sm:flex-row sm:items-center gap-3',
        status?.connected ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/40'
      )}>
        <div className="flex items-center gap-2">
          {status?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">
              {status?.connected
                ? `Telegram connected · @${status.bot?.username || 'bot'} → ${status.channel?.title || status.channel?.username || 'channel'}`
                : 'Telegram not connected'}
            </p>
            {!status?.connected && (
              <p className="text-xs text-slate-600">{status?.error || 'Complete Setup Wizard in Channels tab'}</p>
            )}
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2 text-xs">
          <span className="badge bg-white border text-slate-600">
            AI key: {status?.hasAiKey ? 'yes' : 'no'}
          </span>
          <span className="badge bg-white border text-slate-600">
            Server store: {status?.serverStore ? 'Upstash' : 'not set'}
          </span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap',
              tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {language === 'ru' ? t.labelRu : t.labelEn}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Pending approval" value={pending.length} />
          <Metric label="Scheduled" value={scheduled.length} />
          <Metric label="Published" value={published.length} />
          <Metric label="Telegram" value={status?.connected ? 'ON' : 'OFF'} />
        </div>
      )}

      {tab === 'channels' && (
        <SetupWizard status={status} onRefresh={loadStatus} />
      )}

      {tab === 'agent' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">NAMT AI Media Manager</h2>
                <p className="text-sm text-slate-500">
                  Generates drafts only. Never publishes without CEO approval.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Status: {status?.hasAiKey
                ? 'LLM key detected on server — generation available'
                : 'No OPENAI_API_KEY / XAI_API_KEY — generation disabled (no fake drafts)'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input flex-1"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic focus"
              />
              <button
                className="btn-primary"
                disabled={busyId === 'generate' || !status?.hasAiKey}
                onClick={handleGenerate}
              >
                <Sparkles className="w-4 h-4" />
                {busyId === 'generate' ? 'Generating…' : 'Generate draft'}
              </button>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="font-medium text-slate-900">Manual draft (no AI)</h3>
            <input className="input" placeholder="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
            <textarea className="input min-h-[120px]" placeholder="Post text (HTML allowed: <b>, <i>)" value={manualText} onChange={(e) => setManualText(e.target.value)} />
            <button className="btn-secondary" onClick={handleManualEnqueue}>
              <FileText className="w-4 h-4" /> Send to Approval Queue
            </button>
          </div>
        </div>
      )}

      {tab === 'production' && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Content Production pipeline</h2>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Research / Idea — agent or manual topic</li>
            <li>Writing — LLM or manual text</li>
            <li>Fact check — editorial responsibility of CEO on approval</li>
            <li>Image — optional (ENABLE_IMAGE_GEN + OPENAI_API_KEY)</li>
            <li>Quality control → CEO Approval Queue</li>
            <li>Approve & Publish / Schedule → Telegram Bot API</li>
            <li>Analytics — limited to message_id until channel stats API is added</li>
          </ol>
          <p className="mt-4 text-xs text-slate-500">
            Pipeline stages are real status fields on drafts. Nothing is marked published unless Telegram API returns ok.
          </p>
        </div>
      )}

      {tab === 'approval' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500">Schedule time (for Approve & Schedule)</label>
              <input type="datetime-local" className="input" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </div>
          </div>
          {pending.length === 0 && (
            <div className="card p-8 text-center text-slate-500">Approval Queue is empty</div>
          )}
          {pending.map((item) => (
            <div key={item.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.stage} · {item.createdAt}</p>
                </div>
                <span className="badge bg-amber-50 text-amber-800">{item.status}</span>
              </div>
              {item.imageUrl && (
                <div className="rounded-lg overflow-hidden border max-w-md">
                  <img src={item.imageUrl} alt="" className="w-full object-cover max-h-64" />
                </div>
              )}
              <div className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border">{item.text}</div>
              {item.sources?.length > 0 && (
                <div className="text-xs text-slate-500">Sources: {item.sources.join(' · ')}</div>
              )}
              <div className="text-xs text-slate-500">
                Channel: {status?.channel?.title || status?.channel?.username || processEnvChannelHint()}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary text-sm"
                  disabled={busyId === item.id || !status?.connected}
                  onClick={() => handleApprove(item, 'now')}
                >
                  <Send className="w-4 h-4" /> Approve & Publish
                </button>
                <button
                  className="btn-secondary text-sm"
                  disabled={busyId === item.id || !status?.connected || !scheduleAt}
                  onClick={() => handleApprove(item, 'schedule')}
                >
                  <Calendar className="w-4 h-4" /> Approve & Schedule
                </button>
                <button className="btn-ghost text-sm" onClick={() => handleReject(item, true)}>Request Revision</button>
                <button className="btn-ghost text-sm text-rose-600" onClick={() => handleReject(item, false)}>Reject</button>
              </div>
              {!status?.connected && (
                <p className="text-xs text-amber-700">Connect Telegram in Channels before publish.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="space-y-3">
          {scheduled.length === 0 && <div className="card p-6 text-slate-500 text-center">No scheduled posts</div>}
          {scheduled.map((item) => (
            <div key={item.id} className="card p-4 flex justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.scheduledAt}</p>
              </div>
              <span className="badge bg-blue-50 text-blue-700">scheduled</span>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            Server cron runs every 15 minutes when Upstash is configured. Without Upstash, use Approve & Publish only.
          </p>
        </div>
      )}

      {tab === 'published' && (
        <div className="space-y-3">
          {published.length === 0 && <div className="card p-6 text-slate-500 text-center">No published posts in this session</div>}
          {published.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{item.title}</p>
                <span className="badge bg-emerald-50 text-emerald-700">published</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {item.publishedAt} · msg {item.telegramMessageId ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="card p-5 space-y-3 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-900">Media Settings (server env)</h2>
          <p>Secrets are set only in Vercel Project → Settings → Environment Variables. Never in GitHub.</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>TELEGRAM_BOT_TOKEN — required</li>
            <li>TELEGRAM_CHANNEL_ID — @channel or numeric -100…</li>
            <li>OPENAI_API_KEY or XAI_API_KEY — optional AI drafts</li>
            <li>ENABLE_IMAGE_GEN=true — optional DALL·E (needs OPENAI_API_KEY)</li>
            <li>UPSTASH_REDIS_REST_URL + TOKEN — scheduled posts + daily cron</li>
            <li>CRON_SECRET — protect cron routes</li>
            <li>MEDIA_API_SECRET — optional write protection</li>
          </ul>
        </div>
      )}
    </div>
  )
}

function processEnvChannelHint() {
  return 'TELEGRAM_CHANNEL_ID (server)'
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

function SetupWizard({ status, onRefresh }: { status: TelegramStatus | null; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-namt-600" />
          <h2 className="font-semibold text-slate-900">Telegram Setup Wizard</h2>
        </div>
        <p className="text-sm text-slate-600">
          Official Bot API only. CEO must create the bot and grant channel admin rights. The platform never asks you to paste the token into the browser — only into Vercel env.
        </p>

        <ol className="space-y-4 text-sm">
          <Step n={1} title="Create a bot via @BotFather">
            Open Telegram → search <b>@BotFather</b> → <code>/newbot</code> → follow prompts → copy the <b>HTTP API token</b>.
          </Step>
          <Step n={2} title="Create or choose the NAMT AI channel">
            Create a public/private channel for NAMT AI. Copy username (<code>@namt_ai</code>) or numeric id later.
          </Step>
          <Step n={3} title="Add the bot as channel administrator">
            Channel → Administrators → Add administrator → select your bot.
            Enable at least: <b>Post messages</b>. For branding attempts: change channel info if available.
          </Step>
          <Step n={4} title="Set Vercel environment variables">
            Vercel → Project → Settings → Environment Variables:
            <ul className="list-disc list-inside mt-1 text-slate-600">
              <li><code>TELEGRAM_BOT_TOKEN</code> = token from BotFather</li>
              <li><code>TELEGRAM_CHANNEL_ID</code> = <code>@your_channel</code> or <code>-100…</code></li>
            </ul>
            Redeploy after saving.
          </Step>
          <Step n={5} title="Verify connection">
            Click Refresh status. You should see bot username and channel title.
            <div className="mt-2">
              <button type="button" className="btn-secondary text-sm" onClick={onRefresh}>Check connection</button>
            </div>
          </Step>
        </ol>

        {status?.connected && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">
            Connected: @{status.bot?.username} → {status.channel?.title || status.channel?.username}
            {status.channel?.error && <p className="text-amber-800 mt-1">{status.channel.error}</p>}
          </div>
        )}

        <a
          className="text-sm text-namt-700 inline-flex items-center gap-1 hover:underline"
          href="https://core.telegram.org/bots/api"
          target="_blank"
          rel="noreferrer"
        >
          Telegram Bot API docs <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="card p-5 text-sm text-slate-600">
        <h3 className="font-medium text-slate-900 mb-2">Channel branding</h3>
        <p>
          setChatDescription / setChatPhoto require admin rights and may be limited by Telegram.
          Agent may <b>propose</b> avatar, description and pinned welcome post for CEO approval;
          automatic application is best-effort and will report API errors honestly if unsupported.
        </p>
      </div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0">{n}</div>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <div className="text-slate-600 mt-1 leading-relaxed">{children}</div>
      </div>
    </li>
  )
}
