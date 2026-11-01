import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency, formatDate } from '../lib/utils'
import type { AgencyProject, AgencyProjectStatus, AgencyService, AgencyProposal } from '../types'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

const projectStatuses: AgencyProjectStatus[] = ['LEAD', 'PROPOSAL', 'ACTIVE', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']

export function Agency() {
  const { t } = useTranslation()
  const services = useAppStore(s => s.agencyServices)
  const projects = useAppStore(s => s.agencyProjects)
  const proposals = useAppStore(s => s.agencyProposals)
  const employees = useAppStore(s => s.employees)
  const addService = useAppStore(s => s.addAgencyService)
  const updateService = useAppStore(s => s.updateAgencyService)
  const deleteService = useAppStore(s => s.deleteAgencyService)
  const addProject = useAppStore(s => s.addAgencyProject)
  const updateProject = useAppStore(s => s.updateAgencyProject)
  const deleteProject = useAppStore(s => s.deleteAgencyProject)
  const addProposal = useAppStore(s => s.addAgencyProposal)
  const updateProposal = useAppStore(s => s.updateAgencyProposal)
  const deleteProposal = useAppStore(s => s.deleteAgencyProposal)

  const [tab, setTab] = useState<'projects' | 'services' | 'proposals'>('projects')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [modal, setModal] = useState<'service' | 'project' | 'proposal' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const [svcForm, setSvcForm] = useState({ name: '', description: '', priceFrom: '', currency: 'RUB' as const, status: 'ACTIVE' as const })
  const [projForm, setProjForm] = useState({
    name: '', clientName: '', description: '', amount: '', currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
    deadline: '', assigneeId: '', status: 'LEAD' as AgencyProjectStatus, progress: 0,
  })
  const [propForm, setPropForm] = useState({
    title: '', clientName: '', amount: '', currency: 'RUB' as 'RUB' | 'USD' | 'EUR', status: 'DRAFT' as AgencyProposal['status'],
  })

  const filteredProjects = projects.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
    const matchS = statusFilter === 'ALL' || p.status === statusFilter
    return matchQ && matchS
  })

  const openService = (s?: AgencyService) => {
    if (s) {
      setEditId(s.id)
      setSvcForm({ name: s.name, description: s.description, priceFrom: String(s.priceFrom), currency: s.currency as 'RUB', status: s.status as 'ACTIVE' })
    } else {
      setEditId(null)
      setSvcForm({ name: '', description: '', priceFrom: '', currency: 'RUB', status: 'ACTIVE' })
    }
    setModal('service')
  }

  const saveService = () => {
    if (!svcForm.name.trim()) return
    const payload = {
      name: svcForm.name,
      description: svcForm.description,
      priceFrom: Number(svcForm.priceFrom) || 0,
      currency: svcForm.currency,
      status: svcForm.status,
      isDemo: false,
    }
    if (editId) updateService(editId, payload)
    else addService(payload)
    setModal(null)
  }

  const openProject = (p?: AgencyProject) => {
    if (p) {
      setEditId(p.id)
      setProjForm({
        name: p.name, clientName: p.clientName, description: p.description,
        amount: String(p.amount), currency: p.currency, deadline: p.deadline || '',
        assigneeId: p.assigneeId || '', status: p.status, progress: p.progress,
      })
    } else {
      setEditId(null)
      setProjForm({ name: '', clientName: '', description: '', amount: '', currency: 'RUB', deadline: '', assigneeId: '', status: 'LEAD', progress: 0 })
    }
    setModal('project')
  }

  const saveProject = () => {
    if (!projForm.name.trim()) return
    const payload = {
      name: projForm.name,
      clientName: projForm.clientName,
      clientId: null,
      description: projForm.description,
      amount: Number(projForm.amount) || 0,
      currency: projForm.currency,
      deadline: projForm.deadline || null,
      assigneeId: projForm.assigneeId || null,
      status: projForm.status,
      progress: Number(projForm.progress) || 0,
      stages: editId ? (projects.find(x => x.id === editId)?.stages || []) : [],
      isDemo: false,
    }
    if (editId) updateProject(editId, payload)
    else addProject(payload)
    setModal(null)
  }

  const openProposal = (p?: AgencyProposal) => {
    if (p) {
      setEditId(p.id)
      setPropForm({ title: p.title, clientName: p.clientName, amount: String(p.amount), currency: p.currency, status: p.status })
    } else {
      setEditId(null)
      setPropForm({ title: '', clientName: '', amount: '', currency: 'RUB', status: 'DRAFT' })
    }
    setModal('proposal')
  }

  const saveProposal = () => {
    if (!propForm.title.trim()) return
    const payload = {
      title: propForm.title,
      clientName: propForm.clientName,
      amount: Number(propForm.amount) || 0,
      currency: propForm.currency,
      status: propForm.status,
      isDemo: false,
    }
    if (editId) updateProposal(editId, payload)
    else addProposal(payload)
    setModal(null)
  }

  const confirmDel = (fn: () => void) => {
    if (window.confirm(t('confirmDelete'))) fn()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('agency')}</h1>
          <p className="text-slate-500 mt-1">NAMT Agency · {t('services')} / {t('projects')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === 'services' && <button onClick={() => openService()} className="btn-primary"><Plus className="w-4 h-4" /> Service</button>}
          {tab === 'projects' && <button onClick={() => openProject()} className="btn-primary"><Plus className="w-4 h-4" /> Project</button>}
          {tab === 'proposals' && <button onClick={() => openProposal()} className="btn-primary"><Plus className="w-4 h-4" /> Proposal</button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(['projects', 'services', 'proposals'] as const).map(x => (
          <button key={x} onClick={() => setTab(x)} className={`px-3 py-1.5 text-sm rounded-lg ${tab === x ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {x === 'projects' ? t('projects') : x === 'services' ? t('services') : 'Proposals'}
          </button>
        ))}
      </div>

      {tab === 'projects' && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-9" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">{t('allData')}</option>
              {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map(p => (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      {p.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{p.clientName}</p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-700 text-[10px]">{p.status}</span>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{formatCurrency(p.amount, p.currency)}</span>
                  <span>{p.deadline ? formatDate(p.deadline) : '—'}</span>
                  <span>{employees.find(e => e.id === p.assigneeId)?.role || '—'}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{p.progress}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-namt-500 rounded-full" style={{ width: `${Math.min(100, p.progress)}%` }} />
                  </div>
                </div>
                {p.stages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.stages.map(st => (
                      <span key={st.id} className={`badge text-[10px] ${st.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{st.title}</span>
                    ))}
                  </div>
                )}
                {p.history.length > 0 && (
                  <div className="mt-3 text-xs text-slate-400 space-y-0.5">
                    {p.history.slice(0, 2).map(h => <div key={h.id}>{h.at}: {h.text}</div>)}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openProject(p)} className="btn-secondary text-sm flex-1"><Pencil className="w-3.5 h-3.5" /> {t('edit')}</button>
                  <button onClick={() => confirmDel(() => deleteProject(p.id))} className="btn-ghost text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                {s.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{s.description}</p>
              <p className="text-namt-600 font-medium mt-3">from {formatCurrency(s.priceFrom, s.currency)}</p>
              <span className="badge bg-emerald-50 text-emerald-700 mt-2">{s.status}</span>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openService(s)} className="btn-secondary text-sm flex-1"><Pencil className="w-3.5 h-3.5" /> {t('edit')}</button>
                <button onClick={() => confirmDel(() => deleteService(s.id))} className="btn-ghost text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'proposals' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('title')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('clients')}</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">{t('amount')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('status')}</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proposals.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.title} {p.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px] ml-1">{t('demo')}</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{p.clientName}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.amount, p.currency)}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-700">{p.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openProposal(p)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                    <button onClick={() => confirmDel(() => deleteProposal(p.id))} className="p-1.5 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4 text-slate-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'service' && (
        <Modal title={editId ? t('edit') : 'Service'} onClose={() => setModal(null)} onSave={saveService}>
          <input className="input" placeholder={t('name')} value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} />
          <textarea className="input min-h-[60px]" placeholder={t('description')} value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} />
          <input type="number" className="input" placeholder={t('amount')} value={svcForm.priceFrom} onChange={e => setSvcForm({ ...svcForm, priceFrom: e.target.value })} />
        </Modal>
      )}

      {modal === 'project' && (
        <Modal title={editId ? t('edit') : 'Project'} onClose={() => setModal(null)} onSave={saveProject}>
          <input className="input" placeholder={t('title')} value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} />
          <input className="input" placeholder={t('company')} value={projForm.clientName} onChange={e => setProjForm({ ...projForm, clientName: e.target.value })} />
          <textarea className="input min-h-[60px]" placeholder={t('description')} value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input" placeholder={t('amount')} value={projForm.amount} onChange={e => setProjForm({ ...projForm, amount: e.target.value })} />
            <select className="input" value={projForm.currency} onChange={e => setProjForm({ ...projForm, currency: e.target.value as 'RUB' | 'USD' | 'EUR' })}>
              <option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="input" value={projForm.deadline} onChange={e => setProjForm({ ...projForm, deadline: e.target.value })} />
            <input type="number" className="input" placeholder="Progress %" value={projForm.progress} onChange={e => setProjForm({ ...projForm, progress: Number(e.target.value) })} />
          </div>
          <select className="input" value={projForm.status} onChange={e => setProjForm({ ...projForm, status: e.target.value as AgencyProjectStatus })}>
            {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={projForm.assigneeId} onChange={e => setProjForm({ ...projForm, assigneeId: e.target.value })}>
            <option value="">— {t('assignee')} —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.role}</option>)}
          </select>
        </Modal>
      )}

      {modal === 'proposal' && (
        <Modal title={editId ? t('edit') : 'Proposal'} onClose={() => setModal(null)} onSave={saveProposal}>
          <input className="input" placeholder={t('title')} value={propForm.title} onChange={e => setPropForm({ ...propForm, title: e.target.value })} />
          <input className="input" placeholder={t('company')} value={propForm.clientName} onChange={e => setPropForm({ ...propForm, clientName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input" placeholder={t('amount')} value={propForm.amount} onChange={e => setPropForm({ ...propForm, amount: e.target.value })} />
            <select className="input" value={propForm.currency} onChange={e => setPropForm({ ...propForm, currency: e.target.value as 'RUB' | 'USD' | 'EUR' })}>
              <option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option>
            </select>
          </div>
          <select className="input" value={propForm.status} onChange={e => setPropForm({ ...propForm, status: e.target.value as AgencyProposal['status'] })}>
            <option value="DRAFT">DRAFT</option><option value="SENT">SENT</option><option value="ACCEPTED">ACCEPTED</option><option value="REJECTED">REJECTED</option>
          </select>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose, onSave }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-elevated w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">{t('cancel')}</button>
          <button onClick={onSave} className="btn-primary">{t('save')}</button>
        </div>
      </div>
    </div>
  )
}
