export type ItemStatus = 'critical' | 'warning' | 'good'

export interface DashboardItem {
  id: string
  name: string
  unit: 'PRN' | 'Medimagem'
  category: string
  dueDate: string // YYYY-MM-DD format
}
