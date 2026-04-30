import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardItem } from '@/types'
import { getDaysToDueDate } from '@/lib/dashboard-utils'

interface UrgentActionsProps {
  items: DashboardItem[]
}

export function UrgentActions({ items }: UrgentActionsProps) {
  const criticalItems = items
    .filter((item) => {
      const days = getDaysToDueDate(item.dueDate)
      return days <= 7
    })
    .sort((a, b) => getDaysToDueDate(a.dueDate) - getDaysToDueDate(b.dueDate))

  if (criticalItems.length === 0) return null

  return (
    <Card className="glass-panel border-red-200 shadow-md animate-fade-in-up mb-6 bg-red-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Ações Urgentes de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalItems.map((item) => {
            const days = getDaysToDueDate(item.dueDate)
            const daysText =
              days < 0
                ? `venceu há ${Math.abs(days)} dias`
                : days === 0
                  ? 'vence hoje'
                  : `vence em ${days} dias`
            const entityText =
              item.type === 'Colaborador'
                ? 'O registro do colaborador'
                : 'A vistoria do equipamento'

            return (
              <div
                key={item.id}
                className="p-3 bg-white/80 border border-red-100 rounded-md shadow-sm text-sm text-slate-700 font-medium flex items-start gap-2 backdrop-blur-sm"
              >
                <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <p>
                  <span className="text-red-600 font-bold mr-1">Atenção:</span>
                  {entityText} <span className="font-bold text-slate-900">{item.name}</span>{' '}
                  {daysText}.<span className="ml-1 text-slate-500">Unidade: {item.unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
