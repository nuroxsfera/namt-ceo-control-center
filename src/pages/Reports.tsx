import { useTranslation } from '../hooks/useTranslation'
import { FileText, Download } from 'lucide-react'

const reportTypes = [
  { id: 'daily', name: 'Ежедневный отчёт', desc: 'Сводка за день: задачи, события, AI-активность' },
  { id: 'weekly', name: 'Еженедельный отчёт', desc: 'Ключевые метрики недели по подразделениям' },
  { id: 'monthly', name: 'Ежемесячный отчёт', desc: 'Полный обзор месяца + финансы' },
  { id: 'financial', name: 'Финансовый отчёт', desc: 'Доходы, расходы, баланс, прогнозы' },
  { id: 'operational', name: 'Операционный отчёт', desc: 'Процессы, загрузка, блокеры' },
  { id: 'sales', name: 'Отчёт по продажам', desc: 'Воронка, сделки, конверсия' },
  { id: 'marketing', name: 'Маркетинговый отчёт', desc: 'Каналы, контент, охваты' },
  { id: 'ai', name: 'Отчёт по AI Employees', desc: 'Активность и результаты AI-сотрудников' },
]

export function Reports() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('reports')}</h1>
        <p className="text-slate-500 mt-1">Центр отчётности · Экспорт CSV (DEMO)</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map(r => (
          <div key={r.id} className="card p-5 card-hover flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{r.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
            </div>
            <button className="btn-ghost text-xs flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        ))}
      </div>
      
      <div className="card p-5 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>DEMO mode:</strong> Реальные отчёты и экспорт будут подключены на следующем этапе. 
          Сейчас интерфейс и структура готовы.
        </p>
      </div>
    </div>
  )
}
