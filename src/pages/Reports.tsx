import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { FileText, Download } from 'lucide-react'

export function Reports() {
  const { t } = useTranslation()
  const tasks = useAppStore(s => s.tasks)
  const clients = useAppStore(s => s.clients)
  const finance = useAppStore(s => s.finance)
  const decisions = useAppStore(s => s.decisions)

  const exportCsv = (name: string, rows: string[][]) => {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reports = [
    {
      id: 'tasks',
      name: languageSafe('Tasks / Задачи'),
      desc: `${tasks.length} records`,
      run: () => exportCsv('namt-tasks', [
        ['id', 'title', 'status', 'priority', 'department', 'deadline', 'isDemo'],
        ...tasks.map(t => [t.id, t.title, t.status, t.priority, t.department, t.deadline || '', String(!!t.isDemo)])
      ])
    },
    {
      id: 'clients',
      name: languageSafe('Clients / Клиенты'),
      desc: `${clients.length} records`,
      run: () => exportCsv('namt-clients', [
        ['id', 'name', 'company', 'status', 'country', 'isDemo'],
        ...clients.map(c => [c.id, c.name, c.company, c.status, c.country, String(!!c.isDemo)])
      ])
    },
    {
      id: 'finance',
      name: languageSafe('Finance / Финансы'),
      desc: `${finance.length} records`,
      run: () => exportCsv('namt-finance', [
        ['id', 'type', 'amount', 'currency', 'category', 'date', 'isDemo'],
        ...finance.map(f => [f.id, f.type, String(f.amount), f.currency, f.category, f.date, String(!!f.isDemo)])
      ])
    },
    {
      id: 'decisions',
      name: languageSafe('CEO Decisions'),
      desc: `${decisions.length} records`,
      run: () => exportCsv('namt-decisions', [
        ['id', 'title', 'status', 'requestedBy', 'createdAt'],
        ...decisions.map(d => [d.id, d.title, d.status, d.requestedBy, d.createdAt])
      ])
    },
  ]

  function languageSafe(s: string) { return s }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('reports')}</h1>
        <p className="text-slate-500 mt-1">{t('reportCenter')} · CSV export from live store data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="card p-5 card-hover flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{r.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
            </div>
            <button onClick={r.run} className="btn-secondary text-xs flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {t('exportCsv')}
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>DEMO:</strong> CSV экспортирует текущие данные из localStorage (включая DEMO-записи с флагом isDemo).
        </p>
      </div>
    </div>
  )
}
