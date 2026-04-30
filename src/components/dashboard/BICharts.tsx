import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { format, startOfMonth, addMonths, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DashboardItem } from '@/types'
import { calculateItemStatus } from '@/lib/dashboard-utils'

interface BIChartsProps {
  items: DashboardItem[]
}

const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']

export function BICharts({ items }: BIChartsProps) {
  const complianceData = useMemo(() => {
    let prnOk = 0,
      prnPen = 0,
      medOk = 0,
      medPen = 0

    items.forEach((item) => {
      const isOk =
        calculateItemStatus(item.dueDate) === 'good' ||
        item.status === 'Completed/Archived' ||
        item.status === 'Validated by Finance'
      if (item.unit === 'PRN Diagnósticos') {
        if (isOk) prnOk++
        else prnPen++
      } else {
        if (isOk) medOk++
        else medPen++
      }
    })

    return [
      { name: 'PRN - Em Dia', value: prnOk },
      { name: 'PRN - Pendente', value: prnPen },
      { name: 'Medimagem - Em Dia', value: medOk },
      { name: 'Medimagem - Pendente', value: medPen },
    ]
  }, [items])

  const costData = useMemo(() => {
    const months = []
    const today = new Date()
    for (let i = 0; i < 6; i++) {
      months.push(startOfMonth(addMonths(today, i)))
    }

    return months.map((monthDate) => {
      const monthLabel = format(monthDate, 'MMM/yyyy', { locale: ptBR })
      let prnCost = 0,
        medCost = 0

      items.forEach((item) => {
        if (item.dueDate && item.cost) {
          const dueDate = new Date(item.dueDate)
          if (isSameMonth(dueDate, monthDate)) {
            if (item.unit === 'PRN Diagnósticos') prnCost += item.cost
            else medCost += item.cost
          }
        }
      })

      return { month: monthLabel, PRN: prnCost, Medimagem: medCost }
    })
  }, [items])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 print:hidden animate-fade-in-up">
      <Card className="glass-panel shadow-sm border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#004A99]">
            Saúde das Unidades (Compliance)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend className="text-xs" />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-panel shadow-sm border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#004A99]">
            Timeline Financeira (Custos Estimados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              PRN: { label: 'PRN Diagnósticos', color: '#004A99' },
              Medimagem: { label: 'Medimagem', color: '#8b5cf6' },
            }}
            className="h-[260px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tickFormatter={(val) => `R$${val}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend className="text-xs" />
                <Bar dataKey="PRN" stackId="a" fill="var(--color-PRN)" radius={[0, 0, 4, 4]} />
                <Bar
                  dataKey="Medimagem"
                  stackId="a"
                  fill="var(--color-Medimagem)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
