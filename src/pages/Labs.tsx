import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { LabProduct, ProductStatus, TaskPriority } from '../types'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'

const stages: ProductStatus[] = ['IDEA', 'VALIDATION', 'PLANNING', 'DEVELOPMENT', 'TESTING', 'MVP', 'LAUNCHED', 'PAUSED']

export function Labs() {
  const { t } = useTranslation()
  const products = useAppStore(s => s.labProducts)
  const employees = useAppStore(s => s.employees)
  const addProduct = useAppStore(s => s.addLabProduct)
  const updateProduct = useAppStore(s => s.updateLabProduct)
  const deleteProduct = useAppStore(s => s.deleteLabProduct)

  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', audience: '', problem: '', businessModel: '',
    stage: 'IDEA' as ProductStatus, version: '0.1', priority: 'MEDIUM' as TaskPriority, assigneeId: '',
  })

  const open = (p?: LabProduct) => {
    if (p) {
      setEditId(p.id)
      setForm({
        name: p.name, description: p.description, audience: p.audience, problem: p.problem,
        businessModel: p.businessModel, stage: p.stage, version: p.version, priority: p.priority,
        assigneeId: p.assigneeId || '',
      })
    } else {
      setEditId(null)
      setForm({ name: '', description: '', audience: '', problem: '', businessModel: '', stage: 'IDEA', version: '0.1', priority: 'MEDIUM', assigneeId: '' })
    }
    setModal(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    const existing = editId ? products.find(x => x.id === editId) : null
    const payload = {
      name: form.name,
      description: form.description,
      audience: form.audience,
      problem: form.problem,
      businessModel: form.businessModel,
      stage: form.stage,
      version: form.version,
      priority: form.priority,
      assigneeId: form.assigneeId || null,
      features: existing?.features || [],
      roadmap: existing?.roadmap || [],
      isDemo: false,
    }
    if (editId) updateProduct(editId, payload)
    else addProduct(payload)
    setModal(false)
  }

  const toggleFeature = (productId: string, featureId: string) => {
    const p = products.find(x => x.id === productId)
    if (!p) return
    updateProduct(productId, {
      features: p.features.map(f => f.id === featureId ? { ...f, done: !f.done } : f),
    })
  }

  const toggleRoadmap = (productId: string, itemId: string) => {
    const p = products.find(x => x.id === productId)
    if (!p) return
    updateProduct(productId, {
      roadmap: p.roadmap.map(r => r.id === itemId ? { ...r, done: !r.done } : r),
    })
  }

  const addFeature = (productId: string) => {
    const title = window.prompt('Feature title')
    if (!title?.trim()) return
    const p = products.find(x => x.id === productId)
    if (!p) return
    updateProduct(productId, {
      features: [...p.features, { id: `ft${Date.now()}`, title: title.trim(), priority: 'MEDIUM', done: false }],
    })
  }

  const addRoadmap = (productId: string) => {
    const title = window.prompt('Roadmap item')
    if (!title?.trim()) return
    const p = products.find(x => x.id === productId)
    if (!p) return
    updateProduct(productId, {
      roadmap: [...p.roadmap, { id: `rm${Date.now()}`, title: title.trim(), done: false, order: p.roadmap.length + 1 }],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('labs')}</h1>
          <p className="text-slate-500 mt-1">NAMT Labs · {t('productCatalog')}</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><Plus className="w-4 h-4" /> Product</button>
      </div>

      <div className="space-y-6">
        {products.map(p => (
          <div key={p.id} className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-slate-900">{p.name}</h2>
                  {p.isDemo && <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{t('demo')}</span>}
                  <span className="badge bg-blue-50 text-blue-700">{p.stage}</span>
                  <span className="badge bg-slate-100 text-slate-600">v{p.version}</span>
                </div>
                <p className="text-slate-600 mt-2 max-w-3xl">{p.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => open(p)} className="btn-secondary text-sm"><Pencil className="w-3.5 h-3.5" /> {t('edit')}</button>
                <button onClick={() => { if (window.confirm(t('confirmDelete'))) deleteProduct(p.id) }} className="btn-ghost text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <Info label="Audience" value={p.audience} />
              <Info label="Problem" value={p.problem} />
              <Info label="Business model" value={p.businessModel} />
              <Info label={t('assignee')} value={employees.find(e => e.id === p.assigneeId)?.role || '—'} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">Features</h3>
                  <button onClick={() => addFeature(p.id)} className="text-xs text-namt-600 hover:underline">+ add</button>
                </div>
                <div className="space-y-2">
                  {p.features.map(f => (
                    <button key={f.id} onClick={() => toggleFeature(p.id, f.id)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${f.done ? 'bg-namt-500 border-namt-500 text-white' : 'border-slate-300'}`}>
                        {f.done && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm flex-1 ${f.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{f.title}</span>
                      <span className="text-[10px] text-slate-400">{f.priority}</span>
                    </button>
                  ))}
                  {p.features.length === 0 && <p className="text-sm text-slate-400">{t('noData')}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">{t('roadmap')}</h3>
                  <button onClick={() => addRoadmap(p.id)} className="text-xs text-namt-600 hover:underline">+ add</button>
                </div>
                <div className="space-y-2">
                  {[...p.roadmap].sort((a, b) => a.order - b.order).map((r, i) => (
                    <button key={r.id} onClick={() => toggleRoadmap(p.id, r.id)} className="w-full flex items-center gap-3 text-left">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${r.done ? 'bg-namt-100 text-namt-700' : 'bg-slate-100 text-slate-500'}`}>
                        {i + 1}
                      </div>
                      <span className={r.done ? 'text-slate-800' : 'text-slate-500'}>{r.title}</span>
                    </button>
                  ))}
                  {p.roadmap.length === 0 && <p className="text-sm text-slate-400">{t('noData')}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="card p-8 text-center text-slate-500">{t('noData')}</div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editId ? t('edit') : 'Product'}</h2>
            <input className="input" placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea className="input min-h-[60px]" placeholder={t('description')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="input" placeholder="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
            <input className="input" placeholder="Problem" value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} />
            <input className="input" placeholder="Business model" value={form.businessModel} onChange={e => setForm({ ...form, businessModel: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as ProductStatus })}>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="Version" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                <option value="LOW">{t('low')}</option>
                <option value="MEDIUM">{t('medium')}</option>
                <option value="HIGH">{t('high')}</option>
                <option value="CRITICAL">{t('critical')}</option>
              </select>
              <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">— {t('assignee')} —</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.role}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={save} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5 line-clamp-2">{value || '—'}</p>
    </div>
  )
}
