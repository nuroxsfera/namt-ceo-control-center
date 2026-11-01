export type Language = 'ru' | 'en'

export type TaskStatus = 
  | 'BACKLOG' 
  | 'READY' 
  | 'IN_PROGRESS' 
  | 'REVIEW' 
  | 'CEO_APPROVAL' 
  | 'DONE' 
  | 'BLOCKED'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AIEmployeeStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'REVIEW' | 'BLOCKED'

export type ClientStatus = 
  | 'LEAD' 
  | 'CONTACTED' 
  | 'NEGOTIATION' 
  | 'PROPOSAL' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'LOST'

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'

export type FinanceType = 'INCOME' | 'EXPENSE'

export type DataSource = 'DEMO' | 'REAL' | 'FORECAST'

export interface AIEmployee {
  id: string
  role: string
  name: string
  description: string
  status: AIEmployeeStatus
  tasksAssigned: number
  tasksCompleted: number
  lastReport: string
  avatarColor: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  department: string
  deadline: string | null
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  country: string
  source: string
  status: ClientStatus
  notes: string
  createdAt: string
  isDemo?: boolean
}

export interface FinanceOperation {
  id: string
  type: FinanceType
  amount: number
  currency: 'RUB' | 'USD' | 'EUR'
  category: string
  description: string
  date: string
  source: DataSource
  isDemo: boolean
}

export interface Decision {
  id: string
  title: string
  description: string
  type: string
  status: DecisionStatus
  requestedBy: string
  amount?: number
  createdAt: string
  decidedAt?: string
  isDemo?: boolean
}

export interface AppState {
  language: Language
  tasks: Task[]
  clients: Client[]
  finance: FinanceOperation[]
  decisions: Decision[]
  employees: AIEmployee[]
}
