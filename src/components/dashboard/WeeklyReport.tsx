import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardItem } from '@/types'
import { getDaysToDueDate } from '@/lib/dashboard-utils'

export function WeeklyReport({ items }: { items: DashboardItem[] }) {
  const dueThisWeek = items.filter((i) => {
    const days = getDaysToDueDate(i.dueDate)
    return days >= 0 && days <= 7 && i.status !== 'Completed/Archived'
  })

  if (dueThisWeek.length === 0) return null

  return (
    <Card
      className="mb-6 border-amber-200 bg-amber-50/50 print:hidden animate-fade-in-up"
      style={{ animationDelay: '100ms' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-700 flex items-center text-sm uppercase tracking-wider">
          <CalendarClock className="mr-2 h-4 w-4" />
          Vencimentos Próximos (7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dueThisWeek.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white p-3 rounded-md border border-amber-100 shadow-sm"
            >
              <div className="font-medium text-sm text-slate-800 truncate pr-2">{item.name}</div>
              <div className="text-xs text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded">
                {new Date(item.dueDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
