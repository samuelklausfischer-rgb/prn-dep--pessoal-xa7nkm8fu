import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardItem } from '@/types'
import { calculateItemStatus } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'

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

  const cards = [
    {
      title: 'Crítico (≤ 7 dias)',
      value: stats.critical,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950/50',
      borderColor: 'border-red-200 dark:border-red-900/50',
      delay: '0ms',
    },
    {
      title: 'Atenção (8-30 dias)',
      value: stats.warning,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/50',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      delay: '100ms',
    },
    {
      title: 'Regular (> 30 dias)',
      value: stats.good,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      delay: '200ms',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, i) => (
        <Card
          key={i}
          className={cn(
            'glass-panel premium-shadow hover:shadow-md transition-all duration-300 animate-fade-in-up',
            card.borderColor,
          )}
          style={{ animationDelay: card.delay }}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <div className={cn('p-3.5 rounded-2xl transition-colors', card.bgColor, card.color)}>
              <card.icon className="h-7 w-7" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[11px]">
                {card.title}
              </p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">{card.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
