export const JOB_STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'] as const
export type JobStatus = typeof JOB_STATUSES[number]
export type WorkMode = 'onsite' | 'hybrid' | 'remote' | 'unspecified'
export const DISCOVERY_CATEGORIES = ['Software & IT', 'Data & Analytics', 'Engineering', 'Design & Creative', 'Product & Project', 'Sales & Marketing', 'Finance & Accounting', 'Operations & Admin', 'Customer Support', 'HR & Recruiting', 'Logistics', 'Legal', 'Healthcare', 'Education', 'Hospitality', 'Other'] as const
export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[number]

export interface StatusEvent {
  id: string
  from: JobStatus | null
  to: JobStatus
  at: string
  note?: string
}

export interface JobApplication {
  id: string
  url: string
  normalizedUrl: string
  platform: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  salary: string
  notes: string
  tags: string[]
  status: JobStatus
  postedAt: string | null
  appliedAt: string | null
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  reviewDismissedAt: string | null
  archived: boolean
  history: StatusEvent[]
}

export interface AppSettings {
  staleDays: number
  compactCards: boolean
}

export interface AppData {
  version: 1
  jobs: JobApplication[]
  settings: AppSettings
  dismissedDiscoveries: string[]
}

export interface JobInput {
  url: string
  platform?: string
  title: string
  company: string
  location?: string
  workMode?: WorkMode
  salary?: string
  notes?: string
  tags?: string[]
  postedAt?: string | null
}

export interface DiscoveredJob {
  key: string
  source: 'Jobicy' | 'Remote OK' | 'Remotive' | 'Remote Landers' | 'Job Opportunities' | 'ไทยมีงานทำ'
  sourceId: string
  url: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  salary: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  salaryPeriod: string
  category: DiscoveryCategory
  employmentType: string
  excerpt: string
  tags: string[]
  postedAt: string | null
  companyLogo: string
  isTracked: boolean
  isDismissed: boolean
}
