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

// Agency
export type AgencyProjectStatus =
  | 'LEAD'
  | 'PROPOSAL'
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export type AgencyServiceStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED'

export interface AgencyService {
  id: string
  name: string
  description: string
  priceFrom: number
  currency: 'RUB' | 'USD' | 'EUR'
  status: AgencyServiceStatus
  isDemo?: boolean
}

export interface AgencyProjectStage {
  id: string
  title: string
  done: boolean
  date?: string
}

export interface AgencyProjectHistory {
  id: string
  at: string
  text: string
}

export interface AgencyProject {
  id: string
  name: string
  clientName: string
  clientId?: string | null
  description: string
  amount: number
  currency: 'RUB' | 'USD' | 'EUR'
  deadline: string | null
  assigneeId: string | null
  status: AgencyProjectStatus
  progress: number
  stages: AgencyProjectStage[]
  history: AgencyProjectHistory[]
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

export interface AgencyProposal {
  id: string
  title: string
  clientName: string
  amount: number
  currency: 'RUB' | 'USD' | 'EUR'
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  isDemo?: boolean
}

// Media
export type MediaPostStatus =
  | 'IDEA'
  | 'PLANNED'
  | 'DRAFT'
  | 'REVIEW'
  | 'CEO_APPROVAL'
  | 'READY'
  | 'PUBLISHED'

export interface MediaChannel {
  id: string
  name: string
  platform: string
  language: Language
  url?: string
  isDemo?: boolean
}

export interface MediaPost {
  id: string
  title: string
  platform: string
  language: Language
  format: string
  publishDate: string | null
  body: string
  status: MediaPostStatus
  channelId: string | null
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

// Labs
export type ProductStatus =
  | 'IDEA'
  | 'VALIDATION'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'MVP'
  | 'LAUNCHED'
  | 'PAUSED'

export interface ProductFeature {
  id: string
  title: string
  priority: TaskPriority
  done: boolean
}

export interface ProductRoadmapItem {
  id: string
  title: string
  done: boolean
  order: number
}

export interface LabProduct {
  id: string
  name: string
  description: string
  audience: string
  problem: string
  businessModel: string
  stage: ProductStatus
  version: string
  priority: TaskPriority
  assigneeId: string | null
  features: ProductFeature[]
  roadmap: ProductRoadmapItem[]
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

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
