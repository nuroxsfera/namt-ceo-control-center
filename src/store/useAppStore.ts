import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Language, Task, Client, FinanceOperation, Decision, AIEmployee,
  AgencyService, AgencyProject, AgencyProposal,
  MediaChannel, MediaPost, LabProduct,
} from '../types'

const today = () => new Date().toISOString().slice(0, 10)
const uid = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`

const defaultEmployees: AIEmployee[] = [
  { id: 'coo', role: 'AI COO', name: 'Aria', description: 'Операционный директор. Координация процессов и эффективность.', status: 'ACTIVE', tasksAssigned: 12, tasksCompleted: 87, lastReport: 'Операционная эффективность +4.2% за неделю', avatarColor: 'bg-teal-500' },
  { id: 'cfo', role: 'AI CFO', name: 'Marcus', description: 'Финансовый директор. Контроль бюджета и прогнозы.', status: 'BUSY', tasksAssigned: 8, tasksCompleted: 64, lastReport: 'Подготовлен прогноз Q4', avatarColor: 'bg-emerald-500' },
  { id: 'cto', role: 'AI CTO', name: 'Nova', description: 'Технический директор. Архитектура и продукты.', status: 'ACTIVE', tasksAssigned: 15, tasksCompleted: 112, lastReport: 'NAMT Content AI — MVP roadmap готов', avatarColor: 'bg-blue-500' },
  { id: 'cmo', role: 'AI CMO', name: 'Luna', description: 'Директор по маркетингу. Рост и бренд.', status: 'IDLE', tasksAssigned: 6, tasksCompleted: 45, lastReport: 'Контент-план на ноябрь утверждён', avatarColor: 'bg-purple-500' },
  { id: 'cco', role: 'AI CCO', name: 'Viktor', description: 'Коммерческий директор. Продажи и клиенты.', status: 'BUSY', tasksAssigned: 9, tasksCompleted: 53, lastReport: '3 новых лида в стадии negotiation', avatarColor: 'bg-amber-500' },
  { id: 'media', role: 'AI Media Director', name: 'Echo', description: 'Директор медиа-направления. Контент и каналы.', status: 'ACTIVE', tasksAssigned: 11, tasksCompleted: 78, lastReport: 'YouTube + TikTok performance report', avatarColor: 'bg-rose-500' },
  { id: 'pm', role: 'AI Product Manager', name: 'Kai', description: 'Менеджер продуктов. Roadmap и фичи.', status: 'REVIEW', tasksAssigned: 7, tasksCompleted: 41, lastReport: 'Feature prioritization для Content AI', avatarColor: 'bg-indigo-500' },
  { id: 'qm', role: 'AI Quality Manager', name: 'Sora', description: 'Менеджер качества. Стандарты и контроль.', status: 'IDLE', tasksAssigned: 4, tasksCompleted: 29, lastReport: 'QA checklist обновлён', avatarColor: 'bg-cyan-500' },
]

const demoTasks: Task[] = [
  { id: 't1', title: 'Подготовить финансовый отчёт за октябрь', description: 'Сводка доходов/расходов + прогноз', status: 'CEO_APPROVAL', priority: 'HIGH', assigneeId: 'cfo', department: 'Finance', deadline: '2026-11-05', createdAt: '2026-10-28', updatedAt: '2026-11-01', isDemo: true },
  { id: 't2', title: 'Запуск контент-плана Media на ноябрь', description: 'RU + EN контент для всех каналов', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: 'media', department: 'Media', deadline: '2026-11-03', createdAt: '2026-10-25', updatedAt: '2026-10-30', isDemo: true },
  { id: 't3', title: 'MVP NAMT Content AI — спецификация', description: 'Финальная спецификация продукта', status: 'REVIEW', priority: 'CRITICAL', assigneeId: 'cto', department: 'Labs', deadline: '2026-11-08', createdAt: '2026-10-20', updatedAt: '2026-10-31', isDemo: true },
  { id: 't4', title: 'Онбординг нового клиента Agency', description: 'AI Automation package', status: 'READY', priority: 'HIGH', assigneeId: 'cco', department: 'Agency', deadline: '2026-11-04', createdAt: '2026-10-29', updatedAt: '2026-10-29', isDemo: true },
  { id: 't5', title: 'Аудит операционных процессов', description: 'Ежемесячный операционный аудит', status: 'BACKLOG', priority: 'MEDIUM', assigneeId: 'coo', department: 'Operations', deadline: null, createdAt: '2026-10-27', updatedAt: '2026-10-27', isDemo: true },
]

const demoClients: Client[] = [
  { id: 'c1', name: 'Александр Петров', company: 'TechNova Group', email: 'a.petrov@technova.demo', phone: '+7 900 000-00-01', country: 'Russia', source: 'Referral', status: 'ACTIVE', notes: 'AI Automation package. DEMO client.', createdAt: '2026-09-15', isDemo: true },
  { id: 'c2', name: 'Elena Schmidt', company: 'Nordic AI Labs', email: 'elena@nordic.demo', phone: '+49 170 000000', country: 'Germany', source: 'Website', status: 'NEGOTIATION', notes: 'Interested in AI Chatbots + Consulting. DEMO.', createdAt: '2026-10-10', isDemo: true },
  { id: 'c3', name: 'James Wilson', company: 'Horizon Media', email: 'j.wilson@horizon.demo', phone: '+1 415 000 0000', country: 'USA', source: 'LinkedIn', status: 'PROPOSAL', notes: 'Content AI interest. DEMO.', createdAt: '2026-10-22', isDemo: true },
]

const demoFinance: FinanceOperation[] = [
  { id: 'f1', type: 'INCOME', amount: 850000, currency: 'RUB', category: 'Agency Services', description: 'AI Automation project — TechNova (DEMO)', date: '2026-10-15', source: 'DEMO', isDemo: true },
  { id: 'f2', type: 'INCOME', amount: 420000, currency: 'RUB', category: 'Consulting', description: 'AI Strategy consulting (DEMO)', date: '2026-10-22', source: 'DEMO', isDemo: true },
  { id: 'f3', type: 'EXPENSE', amount: 185000, currency: 'RUB', category: 'Infrastructure', description: 'Cloud & tools (DEMO)', date: '2026-10-05', source: 'DEMO', isDemo: true },
  { id: 'f4', type: 'EXPENSE', amount: 95000, currency: 'RUB', category: 'Marketing', description: 'Ads & content production (DEMO)', date: '2026-10-18', source: 'DEMO', isDemo: true },
]

const demoDecisions: Decision[] = [
  { id: 'd1', title: 'Утвердить бюджет на Q4 Media', description: 'Запрос на увеличение контент-бюджета на 18%', type: 'Budget', status: 'PENDING', requestedBy: 'AI CMO', amount: 320000, createdAt: '2026-10-30', isDemo: true },
  { id: 'd2', title: 'Запуск MVP NAMT Content AI', description: 'Готовность к публичному запуску MVP', type: 'Product Launch', status: 'PENDING', requestedBy: 'AI CTO', createdAt: '2026-10-31', isDemo: true },
  { id: 'd3', title: 'Новый пакет услуг Agency', description: 'Добавление AI Agents as a Service', type: 'Product', status: 'APPROVED', requestedBy: 'AI CCO', createdAt: '2026-10-20', decidedAt: '2026-10-25', isDemo: true },
]

const demoServices: AgencyService[] = [
  { id: 's1', name: 'AI Automation', description: 'Автоматизация бизнес-процессов на базе AI', priceFrom: 250000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
  { id: 's2', name: 'AI Chatbots', description: 'Чат-боты и ассистенты для поддержки и продаж', priceFrom: 180000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
  { id: 's3', name: 'AI Assistants', description: 'Внутренние AI-ассистенты для команд', priceFrom: 320000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
  { id: 's4', name: 'AI Content Creation', description: 'Генерация и управление контентом', priceFrom: 150000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
  { id: 's5', name: 'Business Process Automation', description: 'Комплексная автоматизация процессов', priceFrom: 400000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
  { id: 's6', name: 'AI Consulting', description: 'Стратегический консалтинг по AI', priceFrom: 120000, currency: 'RUB', status: 'ACTIVE', isDemo: true },
]

const demoProjects: AgencyProject[] = [
  {
    id: 'ap1', name: 'TechNova — AI Automation', clientName: 'TechNova Group', clientId: 'c1',
    description: 'Внедрение AI-автоматизации операционных процессов', amount: 850000, currency: 'RUB',
    deadline: '2026-12-15', assigneeId: 'cco', status: 'IN_PROGRESS', progress: 45,
    stages: [
      { id: 'st1', title: 'Discovery', done: true, date: '2026-09-20' },
      { id: 'st2', title: 'Architecture', done: true, date: '2026-10-05' },
      { id: 'st3', title: 'Implementation', done: false },
      { id: 'st4', title: 'Handover', done: false },
    ],
    history: [
      { id: 'h1', at: '2026-09-15', text: 'Проект создан' },
      { id: 'h2', at: '2026-10-01', text: 'Статус → IN_PROGRESS' },
    ],
    createdAt: '2026-09-15', updatedAt: '2026-11-01', isDemo: true,
  },
  {
    id: 'ap2', name: 'Nordic AI Labs — Chatbots', clientName: 'Nordic AI Labs', clientId: 'c2',
    description: 'Чат-боты для клиентской поддержки', amount: 0, currency: 'EUR',
    deadline: '2026-11-30', assigneeId: 'cco', status: 'PROPOSAL', progress: 10,
    stages: [{ id: 'st5', title: 'Proposal', done: false }],
    history: [{ id: 'h3', at: '2026-10-10', text: 'Лид создан' }],
    createdAt: '2026-10-10', updatedAt: '2026-10-20', isDemo: true,
  },
  {
    id: 'ap3', name: 'Horizon Media — Content AI', clientName: 'Horizon Media', clientId: 'c3',
    description: 'Пилот Content AI для медиапроизводства', amount: 0, currency: 'USD',
    deadline: null, assigneeId: 'pm', status: 'LEAD', progress: 5,
    stages: [], history: [{ id: 'h4', at: '2026-10-22', text: 'Первичный контакт' }],
    createdAt: '2026-10-22', updatedAt: '2026-10-22', isDemo: true,
  },
]

const demoProposals: AgencyProposal[] = [
  { id: 'pr1', title: 'AI Automation package — TechNova', clientName: 'TechNova Group', amount: 850000, currency: 'RUB', status: 'ACCEPTED', createdAt: '2026-09-10', isDemo: true },
  { id: 'pr2', title: 'Chatbots pilot — Nordic', clientName: 'Nordic AI Labs', amount: 42000, currency: 'EUR', status: 'SENT', createdAt: '2026-10-12', isDemo: true },
]

const demoChannels: MediaChannel[] = [
  { id: 'ch1', name: 'NAMT YouTube', platform: 'YouTube', language: 'en', isDemo: true },
  { id: 'ch2', name: 'NAMT TikTok', platform: 'TikTok', language: 'ru', isDemo: true },
  { id: 'ch3', name: 'NAMT Instagram', platform: 'Instagram', language: 'en', isDemo: true },
  { id: 'ch4', name: 'NAMT Telegram', platform: 'Telegram', language: 'ru', isDemo: true },
  { id: 'ch5', name: 'NAMT VK', platform: 'VK', language: 'ru', isDemo: true },
]

const demoPosts: MediaPost[] = [
  { id: 'mp1', title: 'AI Trends 2026 — Deep Dive', platform: 'YouTube', language: 'en', format: 'Long video', publishDate: '2026-11-05', body: 'Script outline for deep dive episode.', status: 'PLANNED', channelId: 'ch1', assigneeId: 'media', createdAt: '2026-10-20', updatedAt: '2026-10-28', isDemo: true },
  { id: 'mp2', title: 'Как мы строим AI-холдинг', platform: 'Telegram', language: 'ru', format: 'Post', publishDate: '2026-10-28', body: 'Текст поста о структуре холдинга.', status: 'PUBLISHED', channelId: 'ch4', assigneeId: 'media', createdAt: '2026-10-25', updatedAt: '2026-10-28', isDemo: true },
  { id: 'mp3', title: 'Behind the scenes: NAMT Labs', platform: 'Instagram', language: 'en', format: 'Carousel', publishDate: '2026-11-02', body: 'Carousel captions draft.', status: 'DRAFT', channelId: 'ch3', assigneeId: 'cmo', createdAt: '2026-10-27', updatedAt: '2026-10-30', isDemo: true },
  { id: 'mp4', title: 'Короткий разбор AI-агентов', platform: 'TikTok', language: 'ru', format: 'Short', publishDate: '2026-11-01', body: 'Сценарий 45 сек.', status: 'REVIEW', channelId: 'ch2', assigneeId: 'media', createdAt: '2026-10-29', updatedAt: '2026-11-01', isDemo: true },
  { id: 'mp5', title: 'Weekly AI Digest #12', platform: 'VK', language: 'ru', format: 'Post', publishDate: null, body: 'Идея дайджеста.', status: 'IDEA', channelId: 'ch5', assigneeId: 'cmo', createdAt: '2026-10-31', updatedAt: '2026-10-31', isDemo: true },
]

const demoProducts: LabProduct[] = [
  {
    id: 'lp1',
    name: 'NAMT Content AI',
    description: 'AI-платформа для генерации, планирования и управления контентом для медиа и бизнеса.',
    audience: 'Медиакоманды, агентства, SMB с контент-потребностью',
    problem: 'Дорого и медленно производить мультиканальный контент RU/EN',
    businessModel: 'SaaS subscription + usage credits',
    stage: 'PLANNING',
    version: '0.1',
    priority: 'CRITICAL',
    assigneeId: 'cto',
    features: [
      { id: 'ft1', title: 'Content generation engine', priority: 'CRITICAL', done: false },
      { id: 'ft2', title: 'RU/EN pipelines', priority: 'HIGH', done: false },
      { id: 'ft3', title: 'Calendar & scheduling', priority: 'MEDIUM', done: false },
      { id: 'ft4', title: 'Channel connectors (manual export)', priority: 'LOW', done: false },
    ],
    roadmap: [
      { id: 'rm1', title: 'Product specification', done: true, order: 1 },
      { id: 'rm2', title: 'Core generation engine', done: false, order: 2 },
      { id: 'rm3', title: 'RU/EN pipelines', done: false, order: 3 },
      { id: 'rm4', title: 'Calendar & scheduling', done: false, order: 4 },
      { id: 'rm5', title: 'Public MVP launch', done: false, order: 5 },
    ],
    createdAt: '2026-09-01', updatedAt: '2026-11-01', isDemo: true,
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
  // Agency
  agencyServices: AgencyService[]
  addAgencyService: (s: Omit<AgencyService, 'id'>) => void
  updateAgencyService: (id: string, u: Partial<AgencyService>) => void
  deleteAgencyService: (id: string) => void
  agencyProjects: AgencyProject[]
  addAgencyProject: (p: Omit<AgencyProject, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void
  updateAgencyProject: (id: string, u: Partial<AgencyProject>) => void
  deleteAgencyProject: (id: string) => void
  agencyProposals: AgencyProposal[]
  addAgencyProposal: (p: Omit<AgencyProposal, 'id' | 'createdAt'>) => void
  updateAgencyProposal: (id: string, u: Partial<AgencyProposal>) => void
  deleteAgencyProposal: (id: string) => void
  // Media
  mediaChannels: MediaChannel[]
  addMediaChannel: (c: Omit<MediaChannel, 'id'>) => void
  updateMediaChannel: (id: string, u: Partial<MediaChannel>) => void
  deleteMediaChannel: (id: string) => void
  mediaPosts: MediaPost[]
  addMediaPost: (p: Omit<MediaPost, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMediaPost: (id: string, u: Partial<MediaPost>) => void
  deleteMediaPost: (id: string) => void
  // Labs
  labProducts: LabProduct[]
  addLabProduct: (p: Omit<LabProduct, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLabProduct: (id: string, u: Partial<LabProduct>) => void
  deleteLabProduct: (id: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (lang) => set({ language: lang }),
      employees: defaultEmployees,
      tasks: demoTasks,
      addTask: (task) => set((s) => ({ tasks: [{ ...task, id: uid('t'), createdAt: today(), updatedAt: today() }, ...s.tasks] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: today() } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      clients: demoClients,
      addClient: (client) => set((s) => ({ clients: [{ ...client, id: uid('c'), createdAt: today() }, ...s.clients] })),
      updateClient: (id, updates) => set((s) => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteClient: (id) => set((s) => ({ clients: s.clients.filter(c => c.id !== id) })),
      finance: demoFinance,
      addFinance: (op) => set((s) => ({ finance: [{ ...op, id: uid('f') }, ...s.finance] })),
      updateFinance: (id, updates) => set((s) => ({ finance: s.finance.map(f => f.id === id ? { ...f, ...updates } : f) })),
      deleteFinance: (id) => set((s) => ({ finance: s.finance.filter(f => f.id !== id) })),
      decisions: demoDecisions,
      updateDecision: (id, status) => set((s) => ({
        decisions: s.decisions.map(d => d.id === id ? { ...d, status, decidedAt: status !== 'PENDING' ? today() : undefined } : d)
      })),
      addDecision: (decision) => set((s) => ({ decisions: [{ ...decision, id: uid('d'), createdAt: today() }, ...s.decisions] })),

      agencyServices: demoServices,
      addAgencyService: (svc) => set((s) => ({ agencyServices: [{ ...svc, id: uid('s') }, ...s.agencyServices] })),
      updateAgencyService: (id, u) => set((s) => ({ agencyServices: s.agencyServices.map(x => x.id === id ? { ...x, ...u } : x) })),
      deleteAgencyService: (id) => set((s) => ({ agencyServices: s.agencyServices.filter(x => x.id !== id) })),

      agencyProjects: demoProjects,
      addAgencyProject: (p) => set((s) => ({
        agencyProjects: [{
          ...p,
          id: uid('ap'),
          history: [{ id: uid('h'), at: today(), text: 'Project created' }],
          createdAt: today(),
          updatedAt: today(),
        }, ...s.agencyProjects]
      })),
      updateAgencyProject: (id, u) => set((s) => ({
        agencyProjects: s.agencyProjects.map(p => {
          if (p.id !== id) return p
          const history = [...p.history]
          if (u.status && u.status !== p.status) {
            history.unshift({ id: uid('h'), at: today(), text: `Status → ${u.status}` })
          }
          return { ...p, ...u, history, updatedAt: today() }
        })
      })),
      deleteAgencyProject: (id) => set((s) => ({ agencyProjects: s.agencyProjects.filter(p => p.id !== id) })),

      agencyProposals: demoProposals,
      addAgencyProposal: (p) => set((s) => ({ agencyProposals: [{ ...p, id: uid('pr'), createdAt: today() }, ...s.agencyProposals] })),
      updateAgencyProposal: (id, u) => set((s) => ({ agencyProposals: s.agencyProposals.map(x => x.id === id ? { ...x, ...u } : x) })),
      deleteAgencyProposal: (id) => set((s) => ({ agencyProposals: s.agencyProposals.filter(x => x.id !== id) })),

      mediaChannels: demoChannels,
      addMediaChannel: (c) => set((s) => ({ mediaChannels: [{ ...c, id: uid('ch') }, ...s.mediaChannels] })),
      updateMediaChannel: (id, u) => set((s) => ({ mediaChannels: s.mediaChannels.map(x => x.id === id ? { ...x, ...u } : x) })),
      deleteMediaChannel: (id) => set((s) => ({ mediaChannels: s.mediaChannels.filter(x => x.id !== id) })),

      mediaPosts: demoPosts,
      addMediaPost: (p) => set((s) => ({ mediaPosts: [{ ...p, id: uid('mp'), createdAt: today(), updatedAt: today() }, ...s.mediaPosts] })),
      updateMediaPost: (id, u) => set((s) => ({ mediaPosts: s.mediaPosts.map(x => x.id === id ? { ...x, ...u, updatedAt: today() } : x) })),
      deleteMediaPost: (id) => set((s) => ({ mediaPosts: s.mediaPosts.filter(x => x.id !== id) })),

      labProducts: demoProducts,
      addLabProduct: (p) => set((s) => ({ labProducts: [{ ...p, id: uid('lp'), createdAt: today(), updatedAt: today() }, ...s.labProducts] })),
      updateLabProduct: (id, u) => set((s) => ({ labProducts: s.labProducts.map(x => x.id === id ? { ...x, ...u, updatedAt: today() } : x) })),
      deleteLabProduct: (id) => set((s) => ({ labProducts: s.labProducts.filter(x => x.id !== id) })),
    }),
    { name: 'namt-ceo-storage-v2' }
  )
)
