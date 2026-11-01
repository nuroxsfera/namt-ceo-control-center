import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { statusLabel } from '../i18n/translations'
import { CheckCircle2, ListTodo } from 'lucide-react'

export function AIEmployees() {
  const { t, language } = useTranslation()
  const employees = useAppStore(s => s.employees)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('aiEmployees')}</h1>
        <p className="text-slate-500 mt-1">Virtual AI team · {t('demoDataNote')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {employees.map((emp) => (
          <div key={emp.id} className="card p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${emp.avatarColor} flex items-center justify-center text-white text-lg font-semibold`}>
                {emp.name[0]}
              </div>
              <span className="badge border text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                {statusLabel(emp.status, language)}
              </span>
            </div>

            <h3 className="font-semibold text-slate-900">{emp.role}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{emp.name}</p>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{emp.description}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ListTodo className="w-3.5 h-3.5" />
                  {t('tasksAssigned')}
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-0.5">{emp.tasksAssigned}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('tasksCompleted')}
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-0.5">{emp.tasksCompleted}</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">{t('lastReport')}</p>
              <p className="text-sm text-slate-700">{emp.lastReport}</p>
            </div>

            <button
              disabled
              className="btn-secondary w-full mt-4 text-sm opacity-60 cursor-not-allowed"
              title={t('comingSoon')}
            >
              {t('viewProfile')} · {t('comingSoon')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
