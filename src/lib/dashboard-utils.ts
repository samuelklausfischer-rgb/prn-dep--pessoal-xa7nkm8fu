import { differenceInDays, parseISO } from 'date-fns'
import type { ItemStatus } from '@/types'

export function calculateItemStatus(dueDate: string): ItemStatus {
  const days = differenceInDays(parseISO(dueDate), new Date())

  if (days < 7) {
    return 'critical'
  }
  if (days <= 30) {
    return 'warning'
  }
  return 'good'
}

export function sortItemsByDate(items: any[]) {
  return [...items].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}
