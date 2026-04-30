export type ItemStatus = 'critical' | 'warning' | 'good'
export type UnitType = 'PRN Diagnósticos' | 'Medimagem'
export type RecordType = 'Colaborador' | 'Equipamento'

export interface DashboardItem {
  id: string
  name: string
  unit: UnitType
  type: RecordType
  dueDate: string // YYYY-MM-DD format
  code?: string
  sector?: string
}
