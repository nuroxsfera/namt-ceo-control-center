import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency, formatDate } from '../lib/utils'
import type { FinanceType } from '../types'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export function Finance() {
  const { t } = useTranslation()
  const finance = useAppStore(s => s.finance)
  const addFinance = useAppStore(s => s.addFinance)
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<FinanceType>('INCOME')
  
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
  })
  
  const totalIncome = finance.filter(f => f.type === 'INCOME').reduce((s, f) => s + f.amount, 0)
  const totalExpenses = finance.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0)
  const balance = totalIncome - totalExpenses
  
  const handleAdd = () => {
    if (!form.amount || !form.category) return
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
    setShowModal(false)
    setForm({ amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), currency: 'RUB' })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('finance')}</h1>
          <p className="text-slate-500 mt-1">Финансовый центр холдинга · DEMO данные помечены</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setType('INCOME'); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('addIncome')}
          </button>
          <button onClick={() => { setType('EXPENSE'); setShowModal(true) }} className="btn-secondary">
            <Plus className="w-4 h-4" /> {t('addExpense')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('totalRevenue')}</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('totalExpenses')}</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-namt-50 text-namt-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('balance')}</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {finance.map(op => (
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
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200">DEMO</span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-600">REAL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {type === 'INCOME' ? t('addIncome') : t('addExpense')}
            </h2>
            <input
              type="number"
              className="input"
              placeholder={t('amount')}
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
            <input
              className="input"
              placeholder={t('category')}
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            />
            <input
              className="input"
              placeholder={t('comment')}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              <select
                className="input"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value as 'RUB' | 'USD' | 'EUR' })}
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={handleAdd} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
