export type ItemStatus = 'critical' | 'warning' | 'good'
export type UnitType = 'PRN Diagnósticos' | 'Medimagem'
export type RecordCategory = 'Technical Asset' | 'Human Capital' | 'Legal Documentation'
export type WorkflowStatus =
  | 'Extracted (IA)'
  | 'Pending Conference'
  | 'Validated by Finance'
  | 'Completed/Archived'

export interface Note {
  id: string
  text: string
  user: string
  timestamp: string
}

export interface BaseDashboardItem {
  id: string
  name: string
  unit: UnitType
  category: RecordCategory
  status: WorkflowStatus
  weight: 1 | 2 | 3
  dueDate: string // YYYY-MM-DD
  cost?: number
  notes: Note[]
  lastEditedBy?: string
  lastEditedAt?: string
}

export interface TechnicalAsset extends BaseDashboardItem {
  category: 'Technical Asset'
  brand?: string
  model?: string
  serialNumber?: string
  lastCalibrationDate?: string
  nextInspectionDate?: string
  responsibleCompany?: string
}

export interface HumanCapital extends BaseDashboardItem {
  category: 'Human Capital'
  role?: string
  admissionDate?: string
  probation45Date?: string
  probation90Date?: string
  periodicExamDate?: string
}

export interface LegalDocumentation extends BaseDashboardItem {
  category: 'Legal Documentation'
  docType?: 'Alvará' | 'Sanitary License' | 'CNES' | 'Rent Contract' | 'Internal Document'
  issueDate?: string
}

export type DashboardItem = TechnicalAsset | HumanCapital | LegalDocumentation
