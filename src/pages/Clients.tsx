import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { Client, ClientStatus } from '../types'
import { statusLabel } from '../i18n/translations'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  source: '',
  status: 'LEAD' as ClientStatus,
  notes: '',
}

export function Clients() {
  const { t, language } = useTranslation()
  const clients = useAppStore(s => s.clients)
  const addClient = useAppStore(s => s.addClient)
  const updateClient = useAppStore(s => s.updateClient)
  const deleteClient = useAppStore(s => s.deleteClient)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (client: Client) => {
    setEditingId(client.id)
    setForm({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      country: client.country,
      source: client.source,
      status: client.status,
      notes: client.notes,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateClient(editingId, form)
    } else {
      addClient({ ...form, isDemo: false })
    }
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) deleteClient(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('clients')}</h1>
          <p className="text-slate-500 mt-1">CRM · {clients.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 w-full sm:w-48"
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('addClient')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div key={client.id} className="card p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex items-center gap-2">
                {client.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
                <span className="badge bg-slate-100 text-slate-700 text-[10px]">{statusLabel(client.status, language)}</span>
              </div>
            </div>
            <h3 className="font-semibold text-slate-900">{client.name}</h3>
            <p className="text-sm text-slate-500">{client.company}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>{client.email}</p>
              <p>{client.phone}</p>
              <p>{client.country} · {client.source}</p>
            </div>
            {client.notes && <p className="mt-3 text-xs text-slate-500 line-clamp-2">{client.notes}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => openEdit(client)} className="btn-secondary flex-1 text-sm">
                <Pencil className="w-3.5 h-3.5" /> {t('edit')}
              </button>
              <button onClick={() => handleDelete(client.id)} className="btn-ghost text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-elevated w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editingId ? t('editClient') : t('addClient')}</h2>
            <input className="input" placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder={t('company')} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input className="input" placeholder={t('email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder={t('country')} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              <input className="input" placeholder={t('source')} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
            </div>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ClientStatus })}>
              {(['LEAD', 'CONTACTED', 'NEGOTIATION', 'PROPOSAL', 'ACTIVE', 'COMPLETED', 'LOST'] as ClientStatus[]).map(s => (
                <option key={s} value={s}>{statusLabel(s, language)}</option>
              ))}
            </select>
            <textarea className="input min-h-[60px]" placeholder={t('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
