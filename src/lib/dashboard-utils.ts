import { differenceInDays, parseISO } from 'date-fns'
import type { ItemStatus, DashboardItem } from '@/types'

export function calculateItemStatus(dueDate: string): ItemStatus {
  if (!dueDate) return 'good'

  // Normalize dates to midnight to avoid time zone artifacts on current day comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = parseISO(dueDate)
  targetDate.setHours(0, 0, 0, 0)

  const days = differenceInDays(targetDate, today)

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
