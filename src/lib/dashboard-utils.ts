import { differenceInDays, parseISO } from 'date-fns'
import type { ItemStatus, DashboardItem } from '@/types'

export function getDaysToDueDate(dueDate: string): number {
  if (!dueDate) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = parseISO(dueDate)
  targetDate.setHours(0, 0, 0, 0)

  return differenceInDays(targetDate, today)
}

export function calculateItemStatus(dueDate: string): ItemStatus {
  if (!dueDate) return 'good'
  const days = getDaysToDueDate(dueDate)

  if (days <= 7) {
    return 'critical'
  }
  if (days <= 30) {
    return 'warning'
  }
  return 'good'
}

export function calculateWeight(item: Partial<DashboardItem>): 1 | 2 | 3 {
  if (item.category === 'Technical Asset') return 3
  if (item.category === 'Legal Documentation') {
    if (item.docType === 'Sanitary License' || item.docType === 'Alvará') return 3
    if (item.docType === 'Internal Document') return 1
    return 2 // Default for CNES, Rent Contract, etc.
  }
  if (item.category === 'Human Capital') return 2
  return 1
}

export function sortItemsByPriorityAndDate(items: DashboardItem[]) {
  return [...items].sort((a, b) => {
    // 1. Sort by Priority (Weight 3 first)
    if (b.weight !== a.weight) {
      return b.weight - a.weight
    }
    // 2. Sort by Due Date
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return da - db
  })
}
