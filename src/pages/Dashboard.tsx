import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency } from '../lib/utils'
import { statusLabel } from '../i18n/translations'
import { TrendingUp, TrendingDown, Users, CheckSquare, Bot, AlertCircle, Briefcase, Clapperboard, FlaskConical } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const chartData = [
  { name: 'May', revenue: 620, expenses: 310 },
  { name: 'Jun', revenue: 680, expenses: 340 },
  { name: 'Jul', revenue: 740, expenses: 360 },
  { name: 'Aug', revenue: 810, expenses: 390 },
  { name: 'Sep', revenue: 890, expenses: 420 },
  { name: 'Oct', revenue: 1270, expenses: 280 },
]

export function Dashboard() {
  const { t, language } = useTranslation()
  const tasks = useAppStore(s => s.tasks)
  const clients = useAppStore(s => s.clients)
  const finance = useAppStore(s => s.finance)
  const decisions = useAppStore(s => s.decisions)
  const employees = useAppStore(s => s.employees)
  const agencyProjects = useAppStore(s => s.agencyProjects)
  const agencyProposals = useAppStore(s => s.agencyProposals)
  const mediaPosts = useAppStore(s => s.mediaPosts)
  const mediaChannels = useAppStore(s => s.mediaChannels)
  const labProducts = useAppStore(s => s.labProducts)

  const demoIncome = finance.filter(f => f.type === 'INCOME' && f.isDemo).reduce((s, f) => s + f.amount, 0)
  const demoExpense = finance.filter(f => f.type === 'EXPENSE' && f.isDemo).reduce((s, f) => s + f.amount, 0)
  const realIncome = finance.filter(f => f.type === 'INCOME' && !f.isDemo).reduce((s, f) => s + f.amount, 0)
  const realExpense = finance.filter(f => f.type === 'EXPENSE' && !f.isDemo).reduce((s, f) => s + f.amount, 0)
  const pendingDecisions = decisions.filter(d => d.status === 'PENDING').length
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE' || e.status === 'BUSY').length

  const activeAgency = agencyProjects.filter(p => ['ACTIVE', 'IN_PROGRESS', 'REVIEW'].includes(p.status))
  const plannedPosts = mediaPosts.filter(p => ['PLANNED', 'DRAFT', 'READY', 'CEO_APPROVAL'].includes(p.status))
  const productsInDev = labProducts.filter(p => ['PLANNING', 'DEVELOPMENT', 'TESTING', 'MVP'].includes(p.stage))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('welcome')}, CEO</h1>
          <p className="text-slate-500 mt-1">{t('overview')}</p>
        </div>
        <select className="input w-auto min-w-[140px]">
          <option>{t('thisMonth')}</option>
          <option>{t('lastMonth')}</option>
          <option>{t('thisQuarter')}</option>
          <option>{t('thisYear')}</option>
        </select>
      </div>

      <div>
        <p className="text-xs font-medium text-amber-700 mb-2">
          <span className="badge bg-amber-50 text-amber-700 border border-amber-200 mr-2">{t('demo')}</span>
          {t('demoDataNote')} — не реальные деньги компании
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label={t('revenue')} value={formatCurrency(demoIncome)} change="+18.4%" positive demo />
          <StatCard label={t('expenses')} value={formatCurrency(demoExpense)} change="-8.2%" positive demo />
          <StatCard label={t('profit')} value={formatCurrency(demoIncome - demoExpense)} change="+24.1%" positive demo />
          <StatCard label={t('totalClients')} value={String(clients.filter(c => c.isDemo).length)} change="+2" positive demo />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">{t('real')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label={t('revenue')} value={formatCurrency(realIncome)} change="—" positive={false} />
          <StatCard label={t('expenses')} value={formatCurrency(realExpense)} change="—" positive={false} />
          <StatCard label={t('profit')} value={formatCurrency(realIncome - realExpense)} change="—" positive={realIncome - realExpense >= 0} />
        </div>
      </div>

      {/* Ops: Agency / Media / Labs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-namt-600" />
            <h3 className="font-semibold text-slate-900">{t('agency')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Active projects" value={String(activeAgency.length)} demo={activeAgency.some(p => p.isDemo)} />
            <Row label="All projects" value={String(agencyProjects.length)} />
            <Row label="Proposals / orders" value={String(agencyProposals.length)} demo={agencyProposals.some(p => p.isDemo)} />
            <Row label="REAL projects" value={String(agencyProjects.filter(p => !p.isDemo).length)} />
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clapperboard className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-slate-900">{t('media')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Channels" value={String(mediaChannels.length)} demo={mediaChannels.some(c => c.isDemo)} />
            <Row label="Planned / pipeline" value={String(plannedPosts.length)} />
            <Row label="All posts" value={String(mediaPosts.length)} />
            <Row label="REAL posts" value={String(mediaPosts.filter(p => !p.isDemo).length)} />
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-900">{t('labs')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="In development" value={String(productsInDev.length)} demo={productsInDev.some(p => p.isDemo)} />
            <Row label="All products" value={String(labProducts.length)} />
            <Row label="Stages" value={productsInDev.map(p => p.stage).join(', ') || '—'} />
            <Row label="REAL products" value={String(labProducts.filter(p => !p.isDemo).length)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{t('businessDynamics')}</h2>
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{t('demo')} · illustrative</span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} name="Revenue (k RUB)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} name="Expenses (k RUB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {t('pendingApprovals')}
              </h3>
              <span className="text-2xl font-semibold text-amber-600">{pendingDecisions}</span>
            </div>
            <div className="space-y-3">
              {decisions.filter(d => d.status === 'PENDING').slice(0, 3).map(d => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{d.requestedBy}</p>
                  </div>
                </div>
              ))}
              {pendingDecisions === 0 && <p className="text-sm text-slate-500">{t('noPending')}</p>}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-namt-600" />
                {t('aiActivity')}
              </h3>
              <span className="text-sm text-slate-500">{activeEmployees}/8</span>
            </div>
            <div className="space-y-2">
              {employees.slice(0, 4).map(emp => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${emp.avatarColor} flex items-center justify-center text-white text-xs font-medium`}>
                    {emp.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{emp.role}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.lastReport}</p>
                  </div>
                  <span className="badge text-[10px] bg-slate-100 text-slate-600">{statusLabel(emp.status, language)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-slate-400" />
              {t('totalTasks')}
            </h2>
            <span className="text-sm text-slate-500">{tasks.length}</span>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'CRITICAL' ? 'bg-rose-500' :
                  task.priority === 'HIGH' ? 'bg-amber-500' :
                  task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.department}</p>
                </div>
                <span className="badge text-[10px] bg-slate-100 text-slate-600">{statusLabel(task.status, language)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              {t('clients')}
            </h2>
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{t('demo')}</span>
          </div>
          <div className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{client.name}</p>
                  <p className="text-xs text-slate-500">{client.company} · {client.country}</p>
                </div>
                <span className="badge text-[10px] bg-slate-100 text-slate-600">{statusLabel(client.status, language)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, demo }: { label: string; value: string; demo?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 flex items-center gap-1">
        {value}
        {demo && <span className="badge bg-amber-50 text-amber-700 text-[9px]">DEMO</span>}
      </span>
    </div>
  )
}

function StatCard({
  label, value, change, positive, demo
}: {
  label: string
  value: string
  change: string
  positive: boolean
  demo?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            {label}
            {demo && <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">{t('demo')}</span>}
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
          {positive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>
      {change !== '—' && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={positive ? 'text-emerald-600' : 'text-rose-600'}>{change}</span>
          <span className="text-slate-400">{t('vsPrevPeriod')}</span>
        </div>
      )}
    </div>
  )
}
