export type ItemStatus = 'critical' | 'warning' | 'good'
export type UnitType = 'PRN Diagnósticos' | 'Medimagem'
export type RecordType = 'Colaborador' | 'Equipamento' | 'Vistoria'

export interface InspectionRecord {
  id: string
  date: string
  description: string
  user: string
}

export interface DashboardItem {
  id: string
  name: string
  unit: UnitType
  type: RecordType
  dueDate: string // YYYY-MM-DD format
  code?: string
  sector?: string
  financeStatus?: 'Validated' | 'Pending'
  validationStatus?: 'Validated' | 'Pending'
  lastEditedBy?: string
  lastEditedAt?: string
  lastInspectionDate?: string
  nextInspectionDate?: string
  responsibleCompany?: string
  inspectionHistory?: InspectionRecord[]
}
