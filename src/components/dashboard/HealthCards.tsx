import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardItem } from '@/types'
import { calculateItemStatus } from '@/lib/dashboard-utils'

interface HealthCardsProps {
  items: DashboardItem[]
}

export function HealthCards({ items }: HealthCardsProps) {
  const stats = items.reduce(
    (acc, item) => {
      const status = calculateItemStatus(item.dueDate)
      acc[status]++
      return acc
    },
    { critical: 0, warning: 0, good: 0 },
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card
        className="glass-panel border-red-200 shadow-sm animate-fade-in-up"
        style={{ animationDelay: '0ms' }}
      >
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Crítico (&lt; 7 dias)</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.critical}</h3>
          </div>
        </CardContent>
      </Card>

      <Card
        className="glass-panel border-amber-200 shadow-sm animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-full text-amber-600">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Atenção (8-30 dias)</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.warning}</h3>
          </div>
        </CardContent>
      </Card>

      <Card
        className="glass-panel border-emerald-200 shadow-sm animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Em dia (&gt; 30 dias)</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.good}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
