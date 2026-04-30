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

export function sortItemsByDate(items: DashboardItem[]) {
  return [...items].sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return da - db
  })
}
