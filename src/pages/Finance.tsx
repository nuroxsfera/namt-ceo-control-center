import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency, formatDate } from '../lib/utils'
import type { FinanceOperation, FinanceType } from '../types'
import { Plus, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from 'lucide-react'

export function Finance() {
  const { t } = useTranslation()
  const finance = useAppStore(s => s.finance)
  const addFinance = useAppStore(s => s.addFinance)
  const updateFinance = useAppStore(s => s.updateFinance)
  const deleteFinance = useAppStore(s => s.deleteFinance)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<FinanceType>('INCOME')
  const [filter, setFilter] = useState<'all' | 'demo' | 'real'>('all')

  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
  })

  const filtered = finance.filter(f => {
    if (filter === 'demo') return f.isDemo
    if (filter === 'real') return !f.isDemo
    return true
  })

  // Aggregates: show both DEMO and REAL clearly
  const demoIncome = finance.filter(f => f.type === 'INCOME' && f.isDemo).reduce((s, f) => s + f.amount, 0)
  const demoExpense = finance.filter(f => f.type === 'EXPENSE' && f.isDemo).reduce((s, f) => s + f.amount, 0)
  const realIncome = finance.filter(f => f.type === 'INCOME' && !f.isDemo).reduce((s, f) => s + f.amount, 0)
  const realExpense = finance.filter(f => f.type === 'EXPENSE' && !f.isDemo).reduce((s, f) => s + f.amount, 0)

  const openCreate = (opType: FinanceType) => {
    setEditingId(null)
    setType(opType)
    setForm({ amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), currency: 'RUB' })
    setShowModal(true)
  }

  const openEdit = (op: FinanceOperation) => {
    setEditingId(op.id)
    setType(op.type)
    setForm({
      amount: String(op.amount),
      category: op.category,
      description: op.description,
      date: op.date,
      currency: op.currency,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.amount || !form.category) return
    if (editingId) {
      updateFinance(editingId, {
        type,
        amount: Number(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        date: form.date,
      })
    } else {
      addFinance({
        type,
        amount: Number(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        date: form.date,
        source: 'REAL',
        isDemo: false,
      })
    }
    setShowModal(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) deleteFinance(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('finance')}</h1>
          <p className="text-slate-500 mt-1">{t('holdingFinance')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openCreate('INCOME')} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('addIncome')}
          </button>
          <button onClick={() => openCreate('EXPENSE')} className="btn-secondary">
            <Plus className="w-4 h-4" /> {t('addExpense')}
          </button>
        </div>
      </div>

      {/* DEMO totals */}
      <div>
        <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-2">
          <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{t('demo')}</span>
          {t('demoDataNote')} — не реальные деньги компании
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label={t('totalRevenue')} value={formatCurrency(demoIncome)} icon={TrendingUp} tone="emerald" />
          <MetricCard label={t('totalExpenses')} value={formatCurrency(demoExpense)} icon={TrendingDown} tone="rose" />
          <MetricCard label={t('balance')} value={formatCurrency(demoIncome - demoExpense)} icon={Wallet} tone="namt" />
        </div>
      </div>

      {/* REAL totals */}
      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">{t('real')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label={t('totalRevenue')} value={formatCurrency(realIncome)} icon={TrendingUp} tone="emerald" />
          <MetricCard label={t('totalExpenses')} value={formatCurrency(realExpense)} icon={TrendingDown} tone="rose" />
          <MetricCard label={t('balance')} value={formatCurrency(realIncome - realExpense)} icon={Wallet} tone="namt" />
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'demo', 'real'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {f === 'all' ? t('allData') : f === 'demo' ? t('demoOnly') : t('realOnly')}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{t('date')}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{t('status')}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{t('category')}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{t('description')}</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">{t('amount')}</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">{t('source')}</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{t('noData')}</td></tr>
            )}
            {filtered.map(op => (
              <tr key={op.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{formatDate(op.date)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${op.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {op.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{op.category}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{op.description}</td>
                <td className={`px-4 py-3 text-right font-medium ${op.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {op.type === 'INCOME' ? '+' : '−'}{formatCurrency(op.amount, op.currency)}
                </td>
                <td className="px-4 py-3">
                  {op.isDemo ? (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{t('demo')}</span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-600">{t('real')}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(op)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 inline-flex">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(op.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 inline-flex">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-elevated w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {editingId ? t('editOperation') : type === 'INCOME' ? t('addIncome') : t('addExpense')}
            </h2>
            <input type="number" className="input" placeholder={t('amount')} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <input className="input" placeholder={t('category')} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input className="input" placeholder={t('comment')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value as 'RUB' | 'USD' | 'EUR' })}>
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
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

function MetricCard({
  label, value, icon: Icon, tone
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'emerald' | 'rose' | 'namt'
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    namt: 'bg-namt-50 text-namt-600',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
