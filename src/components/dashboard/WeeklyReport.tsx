import { CalendarDays, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DashboardItem } from '@/types'
import { getDaysToDueDate } from '@/lib/dashboard-utils'

interface WeeklyReportProps {
  items: DashboardItem[]
}

export function WeeklyReport({ items }: WeeklyReportProps) {
  const next7DaysItems = items.filter((item) => {
    const days = getDaysToDueDate(item.dueDate)
    return days >= 0 && days <= 7
  })

  const totalExpiring = next7DaysItems.length
  const validatedCount = next7DaysItems.filter((i) => i.financeStatus === 'Validated').length
  const pendingCount = next7DaysItems.filter((i) => i.financeStatus !== 'Validated').length
  const validationPercentage =
    totalExpiring === 0 ? 100 : Math.round((validatedCount / totalExpiring) * 100)

  return (
    <Card className="glass-panel border-[#004A99]/20 shadow-md animate-fade-in-up mb-6 bg-gradient-to-br from-white to-blue-50/50">
      <CardHeader className="pb-3 border-b border-slate-100/50">
        <CardTitle className="text-lg font-bold text-[#004A99] flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Resumo Estratégico Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center space-y-2">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Próximos 7 dias
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{totalExpiring}</span>
              <span className="text-slate-600 font-medium">itens vencendo</span>
            </div>
            <p className="text-sm text-slate-500">Requer atenção imediata da equipe responsável.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Status Financeiro (Semana)
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Validados: {validatedCount}
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Clock className="h-4 w-4" />
                  Pendentes: {pendingCount}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Progresso da Validação</span>
                  <span>{validationPercentage}%</span>
                </div>
                <Progress
                  value={validationPercentage}
                  className="h-2.5 bg-slate-100 [&>div]:bg-[#004A99]"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
