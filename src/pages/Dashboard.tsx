import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { formatCurrency } from '../lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckSquare, 
  Bot,
  AlertCircle
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'

const chartData = [
  { name: 'Май', revenue: 620, expenses: 310 },
  { name: 'Июн', revenue: 680, expenses: 340 },
  { name: 'Июл', revenue: 740, expenses: 360 },
  { name: 'Авг', revenue: 810, expenses: 390 },
  { name: 'Сен', revenue: 890, expenses: 420 },
  { name: 'Окт', revenue: 1270, expenses: 280 },
]

export function Dashboard() {
  const { t } = useTranslation()
  const tasks = useAppStore(s => s.tasks)
  const clients = useAppStore(s => s.clients)
  const finance = useAppStore(s => s.finance)
  const decisions = useAppStore(s => s.decisions)
  const employees = useAppStore(s => s.employees)
  
  const totalIncome = finance.filter(f => f.type === 'INCOME').reduce((s, f) => s + f.amount, 0)
  const totalExpenses = finance.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0)
  const profit = totalIncome - totalExpenses
  const pendingDecisions = decisions.filter(d => d.status === 'PENDING').length
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE' || e.status === 'BUSY').length
  
  const stats = [
    {
      label: t('revenue'),
      value: formatCurrency(totalIncome),
      change: '+18.4%',
      positive: true,
      icon: TrendingUp,
      demo: true
    },
    {
      label: t('expenses'),
      value: formatCurrency(totalExpenses),
      change: '-8.2%',
      positive: true,
      icon: TrendingDown,
      demo: true
    },
    {
      label: t('profit'),
      value: formatCurrency(profit),
      change: '+24.1%',
      positive: true,
      icon: TrendingUp,
      demo: true
    },
    {
      label: t('totalClients'),
      value: clients.length.toString(),
      change: '+2',
      positive: true,
      icon: Users,
      demo: true
    },
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('welcome')}, CEO</h1>
          <p className="text-slate-500 mt-1">{t('overview')} · DEMO data</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-auto min-w-[140px]">
            <option>{t('thisMonth')}</option>
            <option>{t('lastMonth')}</option>
            <option>{t('thisQuarter')}</option>
            <option>{t('thisYear')}</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5 card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  {stat.label}
                  {stat.demo && (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                      DEMO
                    </span>
                  )}
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className={stat.positive ? 'text-emerald-600' : 'text-rose-600'}>
                {stat.change}
              </span>
              <span className="text-slate-400">vs prev period</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{t('businessDynamics')}</h2>
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200">DEMO</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0d9488" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                  name="Revenue (k RUB)"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f43f5e" 
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                  strokeWidth={2}
                  name="Expenses (k RUB)"
                />
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
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-namt-600" />
                {t('aiActivity')}
              </h3>
              <span className="text-sm text-slate-500">{activeEmployees}/8 active</span>
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
                  <StatusBadge status={emp.status} />
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
            <span className="text-sm text-slate-500">{tasks.length} total</span>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'CRITICAL' ? 'bg-rose-500' :
                  task.priority === 'HIGH' ? 'bg-amber-500' :
                  task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.department}</p>
                </div>
                <TaskStatusBadge status={task.status} />
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
            <span className="badge bg-amber-50 text-amber-700 border border-amber-200">DEMO</span>
          </div>
          <div className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{client.name}</p>
                  <p className="text-xs text-slate-500">{client.company} · {client.country}</p>
                </div>
                <ClientStatusBadge status={client.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    IDLE: 'bg-slate-100 text-slate-600',
    BUSY: 'bg-amber-50 text-amber-700',
    REVIEW: 'bg-blue-50 text-blue-700',
    BLOCKED: 'bg-rose-50 text-rose-700',
  }
  return (
    <span className={`badge text-[10px] ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

function TaskStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    BACKLOG: 'bg-slate-100 text-slate-600',
    READY: 'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    REVIEW: 'bg-purple-50 text-purple-700',
    CEO_APPROVAL: 'bg-rose-50 text-rose-700',
    DONE: 'bg-emerald-50 text-emerald-700',
    BLOCKED: 'bg-slate-200 text-slate-500',
  }
  return (
    <span className={`badge text-[10px] ${styles[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function ClientStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LEAD: 'bg-slate-100 text-slate-600',
    CONTACTED: 'bg-blue-50 text-blue-700',
    NEGOTIATION: 'bg-amber-50 text-amber-700',
    PROPOSAL: 'bg-purple-50 text-purple-700',
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    COMPLETED: 'bg-slate-100 text-slate-500',
    LOST: 'bg-rose-50 text-rose-600',
  }
  return (
    <span className={`badge text-[10px] ${styles[status] || ''}`}>
      {status}
    </span>
  )
}
