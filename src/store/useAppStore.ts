import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Language, Task, Client, FinanceOperation, Decision, AIEmployee 
} from '../types'

const defaultEmployees: AIEmployee[] = [
  {
    id: 'coo',
    role: 'AI COO',
    name: 'Aria',
    description: 'Операционный директор. Координация процессов и эффективность.',
    status: 'ACTIVE',
    tasksAssigned: 12,
    tasksCompleted: 87,
    lastReport: 'Операционная эффективность +4.2% за неделю',
    avatarColor: 'bg-teal-500'
  },
  {
    id: 'cfo',
    role: 'AI CFO',
    name: 'Marcus',
    description: 'Финансовый директор. Контроль бюджета и прогнозы.',
    status: 'BUSY',
    tasksAssigned: 8,
    tasksCompleted: 64,
    lastReport: 'Подготовлен прогноз Q4',
    avatarColor: 'bg-emerald-500'
  },
  {
    id: 'cto',
    role: 'AI CTO',
    name: 'Nova',
    description: 'Технический директор. Архитектура и продукты.',
    status: 'ACTIVE',
    tasksAssigned: 15,
    tasksCompleted: 112,
    lastReport: 'NAMT Content AI — MVP roadmap готов',
    avatarColor: 'bg-blue-500'
  },
  {
    id: 'cmo',
    role: 'AI CMO',
    name: 'Luna',
    description: 'Директор по маркетингу. Рост и бренд.',
    status: 'IDLE',
    tasksAssigned: 6,
    tasksCompleted: 45,
    lastReport: 'Контент-план на ноябрь утверждён',
    avatarColor: 'bg-purple-500'
  },
  {
    id: 'cco',
    role: 'AI CCO',
    name: 'Viktor',
    description: 'Коммерческий директор. Продажи и клиенты.',
    status: 'BUSY',
    tasksAssigned: 9,
    tasksCompleted: 53,
    lastReport: '3 новых лида в стадии negotiation',
    avatarColor: 'bg-amber-500'
  },
  {
    id: 'media',
    role: 'AI Media Director',
    name: 'Echo',
    description: 'Директор медиа-направления. Контент и каналы.',
    status: 'ACTIVE',
    tasksAssigned: 11,
    tasksCompleted: 78,
    lastReport: 'YouTube + TikTok performance report',
    avatarColor: 'bg-rose-500'
  },
  {
    id: 'pm',
    role: 'AI Product Manager',
    name: 'Kai',
    description: 'Менеджер продуктов. Roadmap и фичи.',
    status: 'REVIEW',
    tasksAssigned: 7,
    tasksCompleted: 41,
    lastReport: 'Feature prioritization для Content AI',
    avatarColor: 'bg-indigo-500'
  },
  {
    id: 'qm',
    role: 'AI Quality Manager',
    name: 'Sora',
    description: 'Менеджер качества. Стандарты и контроль.',
    status: 'IDLE',
    tasksAssigned: 4,
    tasksCompleted: 29,
    lastReport: 'QA checklist обновлён',
    avatarColor: 'bg-cyan-500'
  },
]

const demoTasks: Task[] = [
  {
    id: 't1',
    title: 'Подготовить финансовый отчёт за октябрь',
    description: 'Сводка доходов/расходов + прогноз',
    status: 'CEO_APPROVAL',
    priority: 'HIGH',
    assigneeId: 'cfo',
    department: 'Finance',
    deadline: '2026-11-05',
    createdAt: '2026-10-28',
    updatedAt: '2026-11-01',
    isDemo: true
  },
  {
    id: 't2',
    title: 'Запуск контент-плана Media на ноябрь',
    description: 'RU + EN контент для всех каналов',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assigneeId: 'media',
    department: 'Media',
    deadline: '2026-11-03',
    createdAt: '2026-10-25',
    updatedAt: '2026-10-30',
    isDemo: true
  },
  {
    id: 't3',
    title: 'MVP NAMT Content AI — спецификация',
    description: 'Финальная спецификация продукта',
    status: 'REVIEW',
    priority: 'CRITICAL',
    assigneeId: 'cto',
    department: 'Labs',
    deadline: '2026-11-08',
    createdAt: '2026-10-20',
    updatedAt: '2026-10-31',
    isDemo: true
  },
  {
    id: 't4',
    title: 'Онбординг нового клиента Agency',
    description: 'AI Automation package',
    status: 'READY',
    priority: 'HIGH',
    assigneeId: 'cco',
    department: 'Agency',
    deadline: '2026-11-04',
    createdAt: '2026-10-29',
    updatedAt: '2026-10-29',
    isDemo: true
  },
  {
    id: 't5',
    title: 'Аудит операционных процессов',
    description: 'Ежемесячный операционный аудит',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    assigneeId: 'coo',
    department: 'Operations',
    deadline: null,
    createdAt: '2026-10-27',
    updatedAt: '2026-10-27',
    isDemo: true
  },
]

const demoClients: Client[] = [
  {
    id: 'c1',
    name: 'Александр Петров',
    company: 'TechNova Group',
    email: 'a.petrov@technova.demo',
    phone: '+7 900 000-00-01',
    country: 'Russia',
    source: 'Referral',
    status: 'ACTIVE',
    notes: 'AI Automation package. DEMO client.',
    createdAt: '2026-09-15',
    isDemo: true
  },
  {
    id: 'c2',
    name: 'Elena Schmidt',
    company: 'Nordic AI Labs',
    email: 'elena@nordic.demo',
    phone: '+49 170 000000',
    country: 'Germany',
    source: 'Website',
    status: 'NEGOTIATION',
    notes: 'Interested in AI Chatbots + Consulting. DEMO.',
    createdAt: '2026-10-10',
    isDemo: true
  },
  {
    id: 'c3',
    name: 'James Wilson',
    company: 'Horizon Media',
    email: 'j.wilson@horizon.demo',
    phone: '+1 415 000 0000',
    country: 'USA',
    source: 'LinkedIn',
    status: 'PROPOSAL',
    notes: 'Content AI interest. DEMO.',
    createdAt: '2026-10-22',
    isDemo: true
  },
]

const demoFinance: FinanceOperation[] = [
  {
    id: 'f1',
    type: 'INCOME',
    amount: 850000,
    currency: 'RUB',
    category: 'Agency Services',
    description: 'AI Automation project — TechNova (DEMO)',
    date: '2026-10-15',
    source: 'DEMO',
    isDemo: true
  },
  {
    id: 'f2',
    type: 'INCOME',
    amount: 420000,
    currency: 'RUB',
    category: 'Consulting',
    description: 'AI Strategy consulting (DEMO)',
    date: '2026-10-22',
    source: 'DEMO',
    isDemo: true
  },
  {
    id: 'f3',
    type: 'EXPENSE',
    amount: 185000,
    currency: 'RUB',
    category: 'Infrastructure',
    description: 'Cloud & tools (DEMO)',
    date: '2026-10-05',
    source: 'DEMO',
    isDemo: true
  },
  {
    id: 'f4',
    type: 'EXPENSE',
    amount: 95000,
    currency: 'RUB',
    category: 'Marketing',
    description: 'Ads & content production (DEMO)',
    date: '2026-10-18',
    source: 'DEMO',
    isDemo: true
  },
]

const demoDecisions: Decision[] = [
  {
    id: 'd1',
    title: 'Утвердить бюджет на Q4 Media',
    description: 'Запрос на увеличение контент-бюджета на 18%',
    type: 'Budget',
    status: 'PENDING',
    requestedBy: 'AI CMO',
    amount: 320000,
    createdAt: '2026-10-30',
    isDemo: true
  },
  {
    id: 'd2',
    title: 'Запуск MVP NAMT Content AI',
    description: 'Готовность к публичному запуску MVP',
    type: 'Product Launch',
    status: 'PENDING',
    requestedBy: 'AI CTO',
    createdAt: '2026-10-31',
    isDemo: true
  },
  {
    id: 'd3',
    title: 'Новый пакет услуг Agency',
    description: 'Добавление AI Agents as a Service',
    type: 'Product',
    status: 'APPROVED',
    requestedBy: 'AI CCO',
    createdAt: '2026-10-20',
    decidedAt: '2026-10-25',
    isDemo: true
  },
]

interface AppStore {
  language: Language
  setLanguage: (lang: Language) => void
  
  employees: AIEmployee[]
  
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
  
  finance: FinanceOperation[]
  addFinance: (op: Omit<FinanceOperation, 'id'>) => void
  updateFinance: (id: string, updates: Partial<FinanceOperation>) => void
  deleteFinance: (id: string) => void
  
  decisions: Decision[]
  updateDecision: (id: string, status: Decision['status']) => void
  addDecision: (decision: Omit<Decision, 'id' | 'createdAt'>) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (lang) => set({ language: lang }),
      
      employees: defaultEmployees,
      
      tasks: demoTasks,
      addTask: (task) => set((state) => ({
        tasks: [{
          ...task,
          id: `t${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        }, ...state.tasks]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id 
            ? { ...t, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } 
            : t
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      
      clients: demoClients,
      addClient: (client) => set((state) => ({
        clients: [{
          ...client,
          id: `c${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
        }, ...state.clients]
      })),
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      })),
      
      finance: demoFinance,
      addFinance: (op) => set((state) => ({
        finance: [{ ...op, id: `f${Date.now()}` }, ...state.finance]
      })),
      updateFinance: (id, updates) => set((state) => ({
        finance: state.finance.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      deleteFinance: (id) => set((state) => ({
        finance: state.finance.filter(f => f.id !== id)
      })),
      
      decisions: demoDecisions,
      updateDecision: (id, status) => set((state) => ({
        decisions: state.decisions.map(d => 
          d.id === id 
            ? { 
                ...d, 
                status, 
                decidedAt: status !== 'PENDING' ? new Date().toISOString().slice(0, 10) : undefined 
              } 
            : d
        )
      })),
      addDecision: (decision) => set((state) => ({
        decisions: [{
          ...decision,
          id: `d${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
        }, ...state.decisions]
      })),
    }),
    {
      name: 'namt-ceo-storage',
    }
  )
)
