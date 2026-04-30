import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardItem } from '@/types'

export function UrgentActions({ items }: { items: DashboardItem[] }) {
  const urgent = items.filter((i) => i.weight === 3 && i.status !== 'Completed/Archived')

  if (urgent.length === 0) return null

  return (
    <Card className="mb-6 border-red-200 bg-red-50/50 print:hidden animate-fade-in-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 flex items-center text-sm uppercase tracking-wider">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Motor de Priorização: Ações Críticas (Peso 3)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {urgent.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white p-3 rounded-md border border-red-100 shadow-sm"
            >
              <span className="font-semibold text-slate-800 text-sm truncate">{item.name}</span>
              <span className="text-xs text-red-600 font-medium mt-1">{item.unit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
