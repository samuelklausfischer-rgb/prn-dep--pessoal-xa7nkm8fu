import { Edit2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { DashboardItem } from '@/types'
import { calculateItemStatus, sortItemsByDate } from '@/lib/dashboard-utils'

interface DataTableProps {
  items: DashboardItem[]
  onEdit: (item: DashboardItem) => void
}

export function DataTable({ items, onEdit }: DataTableProps) {
  const sortedItems = sortItemsByDate(items)

  const getStatusBadge = (dueDate: string) => {
    const status = calculateItemStatus(dueDate)
    switch (status) {
      case 'critical':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 animate-pulse-soft border-transparent text-white">
            Crítico
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent text-white">
            Atenção
          </Badge>
        )
      case 'good':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white">
            Em dia
          </Badge>
        )
    }
  }

  const getUnitBadge = (unit: string) => {
    if (unit === 'PRN') {
      return (
        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
          PRN
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
        Medimagem
      </Badge>
    )
  }

  return (
    <Card
      className="glass-panel overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '300ms' }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">Nome/Equipamento</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow key={item.id} className="group transition-colors hover:bg-slate-50/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getUnitBadge(item.unit)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    {format(parseISO(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
