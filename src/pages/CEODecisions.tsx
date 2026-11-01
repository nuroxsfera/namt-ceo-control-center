import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency, formatDate } from '../lib/utils'
import { statusLabel } from '../i18n/translations'
import { Check, X, RotateCcw } from 'lucide-react'

export function CEODecisions() {
  const { t, language } = useTranslation()
  const decisions = useAppStore(s => s.decisions)
  const updateDecision = useAppStore(s => s.updateDecision)

  const pending = decisions.filter(d => d.status === 'PENDING')
  const history = decisions.filter(d => d.status !== 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('ceoDecisions')}</h1>
        <p className="text-slate-500 mt-1">{t('awaitingDecisions')}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          {t('awaitingDecisions')}
          <span className="badge bg-amber-100 text-amber-800">{pending.length}</span>
        </h2>
        <div className="space-y-4">
          {pending.length === 0 && (
            <div className="card p-8 text-center text-slate-500">{t('noPending')}</div>
          )}
          {pending.map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{d.title}</h3>
                    {d.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
                  </div>
                  <p className="text-sm text-slate-600">{d.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>{d.requestedBy}</span>
                    <span>{d.type}</span>
                    <span>{formatDate(d.createdAt)}</span>
                    {d.amount != null && <span className="font-medium text-slate-700">{formatCurrency(d.amount)}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateDecision(d.id, 'APPROVED')}
                    className="btn-primary text-sm px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="w-4 h-4" /> {t('approve')}
                  </button>
                  <button
                    onClick={() => updateDecision(d.id, 'REJECTED')}
                    className="btn-secondary text-sm px-3 py-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <X className="w-4 h-4" /> {t('reject')}
                  </button>
                  <button
                    onClick={() => updateDecision(d.id, 'NEEDS_REVISION')}
                    className="btn-ghost text-sm"
                    title={t('requestRevision')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('decisionLog')}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('title')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('assignee')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3 text-slate-600">{d.requestedBy}</td>
                  <td className="px-4 py-3">
                    <span className="badge text-[10px] bg-slate-100 text-slate-700">{statusLabel(d.status, language)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{d.decidedAt ? formatDate(d.decidedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
