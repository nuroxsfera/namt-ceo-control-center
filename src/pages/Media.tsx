import { useState, useMemo } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatDate } from '../lib/utils'
import type { MediaPost, MediaPostStatus, MediaChannel, Language } from '../types'
import { Plus, Pencil, Trash2, Search, LayoutGrid, List } from 'lucide-react'
import { cn } from '../lib/utils'

const postStatuses: MediaPostStatus[] = ['IDEA', 'PLANNED', 'DRAFT', 'REVIEW', 'CEO_APPROVAL', 'READY', 'PUBLISHED']

export function Media() {
  const { t } = useTranslation()
  const channels = useAppStore(s => s.mediaChannels)
  const posts = useAppStore(s => s.mediaPosts)
  const employees = useAppStore(s => s.employees)
  const addChannel = useAppStore(s => s.addMediaChannel)
  const updateChannel = useAppStore(s => s.updateMediaChannel)
  const deleteChannel = useAppStore(s => s.deleteMediaChannel)
  const addPost = useAppStore(s => s.addMediaPost)
  const updatePost = useAppStore(s => s.updateMediaPost)
  const deletePost = useAppStore(s => s.deleteMediaPost)

  const [tab, setTab] = useState<'posts' | 'channels'>('posts')
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [modal, setModal] = useState<'post' | 'channel' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const [postForm, setPostForm] = useState({
    title: '', platform: 'YouTube', language: 'ru' as Language, format: 'Post',
    publishDate: '', body: '', status: 'IDEA' as MediaPostStatus, channelId: '', assigneeId: '',
  })
  const [chForm, setChForm] = useState({ name: '', platform: 'YouTube', language: 'ru' as Language, url: '' })

  const filtered = posts.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.platform.toLowerCase().includes(q)
    const matchS = statusFilter === 'ALL' || p.status === statusFilter
    return matchQ && matchS
  })

  const calendarGroups = useMemo(() => {
    const map = new Map<string, MediaPost[]>()
    filtered.forEach(p => {
      const key = p.publishDate || 'No date'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const openPost = (p?: MediaPost) => {
    if (p) {
      setEditId(p.id)
      setPostForm({
        title: p.title, platform: p.platform, language: p.language, format: p.format,
        publishDate: p.publishDate || '', body: p.body, status: p.status,
        channelId: p.channelId || '', assigneeId: p.assigneeId || '',
      })
    } else {
      setEditId(null)
      setPostForm({ title: '', platform: 'YouTube', language: 'ru', format: 'Post', publishDate: '', body: '', status: 'IDEA', channelId: '', assigneeId: '' })
    }
    setModal('post')
  }

  const savePost = () => {
    if (!postForm.title.trim()) return
    const payload = {
      title: postForm.title,
      platform: postForm.platform,
      language: postForm.language,
      format: postForm.format,
      publishDate: postForm.publishDate || null,
      body: postForm.body,
      status: postForm.status,
      channelId: postForm.channelId || null,
      assigneeId: postForm.assigneeId || null,
      isDemo: false,
    }
    if (editId) updatePost(editId, payload)
    else addPost(payload)
    setModal(null)
  }

  const openChannel = (c?: MediaChannel) => {
    if (c) {
      setEditId(c.id)
      setChForm({ name: c.name, platform: c.platform, language: c.language, url: c.url || '' })
    } else {
      setEditId(null)
      setChForm({ name: '', platform: 'YouTube', language: 'ru', url: '' })
    }
    setModal('channel')
  }

  const saveChannel = () => {
    if (!chForm.name.trim()) return
    const payload = { name: chForm.name, platform: chForm.platform, language: chForm.language, url: chForm.url || undefined, isDemo: false }
    if (editId) updateChannel(editId, payload)
    else addChannel(payload)
    setModal(null)
  }

  const confirmDel = (fn: () => void) => { if (window.confirm(t('confirmDelete'))) fn() }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('media')}</h1>
          <p className="text-slate-500 mt-1">NAMT Media · {t('contentPipeline')} · no social publishing</p>
        </div>
        <div className="flex gap-2">
          {tab === 'posts' && <button onClick={() => openPost()} className="btn-primary"><Plus className="w-4 h-4" /> Post</button>}
          {tab === 'channels' && <button onClick={() => openChannel()} className="btn-primary"><Plus className="w-4 h-4" /> Channel</button>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['posts', 'channels'] as const).map(x => (
          <button key={x} onClick={() => setTab(x)} className={`px-3 py-1.5 text-sm rounded-lg ${tab === x ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {x === 'posts' ? t('contentPipeline') : t('platforms')}
          </button>
        ))}
        {tab === 'posts' && (
          <div className="ml-auto flex rounded-lg border border-slate-200 overflow-hidden">
            <button onClick={() => setView('table')} className={cn('p-2', view === 'table' ? 'bg-slate-100' : '')}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('calendar')} className={cn('p-2', view === 'calendar' ? 'bg-slate-100' : '')}><LayoutGrid className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {tab === 'channels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {channels.map(c => (
            <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900 flex items-center gap-2">
                  {c.name}
                  {c.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
                </div>
                <p className="text-sm text-slate-500">{c.platform} · {c.language.toUpperCase()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openChannel(c)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => confirmDel(() => deleteChannel(c.id))} className="p-1.5 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'posts' && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-9" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">{t('allData')}</option>
              {postStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {view === 'table' ? (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">{t('title')}</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Platform</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Lang</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">{t('status')}</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">{t('date')}</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{p.title} {p.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px] ml-1">{t('demo')}</span>}</td>
                      <td className="px-4 py-3">{p.platform}</td>
                      <td className="px-4 py-3">{p.language.toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <select className="text-xs border border-slate-200 rounded px-2 py-1" value={p.status} onChange={e => updatePost(p.id, { status: e.target.value as MediaPostStatus })}>
                          {postStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.publishDate ? formatDate(p.publishDate) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openPost(p)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                        <button onClick={() => confirmDel(() => deletePost(p.id))} className="p-1.5 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4 text-slate-500" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {calendarGroups.map(([date, items]) => (
                <div key={date} className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{date === 'No date' ? 'No date' : formatDate(date)}</h3>
                  <div className="space-y-2">
                    {items.map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                          <p className="text-xs text-slate-500">{p.platform} · {p.status}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openPost(p)} className="p-1.5 hover:bg-white rounded"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => confirmDel(() => deletePost(p.id))} className="p-1.5 hover:bg-white rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modal === 'post' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editId ? t('edit') : 'Post / Script'}</h2>
            <input className="input" placeholder={t('title')} value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={postForm.platform} onChange={e => setPostForm({ ...postForm, platform: e.target.value })}>
                {['YouTube', 'TikTok', 'Instagram', 'Telegram', 'VK'].map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="input" value={postForm.language} onChange={e => setPostForm({ ...postForm, language: e.target.value as Language })}>
                <option value="ru">RU</option><option value="en">EN</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Format" value={postForm.format} onChange={e => setPostForm({ ...postForm, format: e.target.value })} />
              <input type="date" className="input" value={postForm.publishDate} onChange={e => setPostForm({ ...postForm, publishDate: e.target.value })} />
            </div>
            <select className="input" value={postForm.status} onChange={e => setPostForm({ ...postForm, status: e.target.value as MediaPostStatus })}>
              {postStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input" value={postForm.channelId} onChange={e => setPostForm({ ...postForm, channelId: e.target.value })}>
              <option value="">— Channel —</option>
              {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="input" value={postForm.assigneeId} onChange={e => setPostForm({ ...postForm, assigneeId: e.target.value })}>
              <option value="">— {t('assignee')} —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.role}</option>)}
            </select>
            <textarea className="input min-h-[100px]" placeholder="Script / body" value={postForm.body} onChange={e => setPostForm({ ...postForm, body: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={savePost} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'channel' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md p-6 space-y-3">
            <h2 className="text-lg font-semibold">{editId ? t('edit') : 'Channel'}</h2>
            <input className="input" placeholder={t('name')} value={chForm.name} onChange={e => setChForm({ ...chForm, name: e.target.value })} />
            <select className="input" value={chForm.platform} onChange={e => setChForm({ ...chForm, platform: e.target.value })}>
              {['YouTube', 'TikTok', 'Instagram', 'Telegram', 'VK'].map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="input" value={chForm.language} onChange={e => setChForm({ ...chForm, language: e.target.value as Language })}>
              <option value="ru">RU</option><option value="en">EN</option>
            </select>
            <input className="input" placeholder="URL (optional)" value={chForm.url} onChange={e => setChForm({ ...chForm, url: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={saveChannel} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
