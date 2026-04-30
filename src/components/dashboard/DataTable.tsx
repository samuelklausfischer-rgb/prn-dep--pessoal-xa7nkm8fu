import { Trash2, AlertCircle, FileText } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import type { DashboardItem } from '@/types'
import { calculateItemStatus, sortItemsByDate } from '@/lib/dashboard-utils'

interface DataTableProps {
  items: DashboardItem[]
  onInlineEdit: (id: string, field: keyof DashboardItem, value: string) => void
  onDelete: (id: string) => void
  onViewDetails?: (item: DashboardItem) => void
}

export function DataTable({ items, onInlineEdit, onDelete, onViewDetails }: DataTableProps) {
  const sortedItems = sortItemsByDate(items)

  const getStatusBadge = (dueDate: string) => {
    const status = calculateItemStatus(dueDate)
    switch (status) {
      case 'critical':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 animate-pulse-soft border-transparent text-white">
            Crítico 🔴
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent text-white">
            Atenção 🟠
          </Badge>
        )
      case 'good':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white">
            Regular 🟢
          </Badge>
        )
    }
  }

  const getUnitBadge = (unit: string) => {
    if (unit === 'PRN Diagnósticos') {
      return (
        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
          PRN Diagnósticos
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
      className="glass-panel overflow-hidden animate-fade-in-up print:shadow-none print:border-none print:bg-transparent"
      style={{ animationDelay: '300ms' }}
    >
      <div className="overflow-x-auto print:overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent whitespace-nowrap">
              <TableHead className="w-[25%] min-w-[200px]">Nome / Equipamento</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Finanças</TableHead>
              <TableHead>Auditoria</TableHead>
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
                  <TableCell className="font-medium p-1">
                    <div className="flex items-center gap-2">
                      {item.validationStatus === 'Pending' && (
                        <div title="Pendente de Validação" className="text-amber-500 animate-pulse">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      )}
                      <Input
                        value={item.name}
                        onChange={(e) => onInlineEdit(item.id, 'name', e.target.value)}
                        className="border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary h-9 shadow-none focus-visible:ring-1 min-w-[150px]"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getUnitBadge(item.unit)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <Badge variant="secondary" className="font-normal bg-slate-100">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => onInlineEdit(item.id, 'dueDate', e.target.value)}
                      className="border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary h-9 w-auto min-w-[140px] shadow-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell>{getStatusBadge(item.dueDate)}</TableCell>
                  <TableCell>
                    <Button
                      variant={item.financeStatus === 'Validated' ? 'default' : 'outline'}
                      size="sm"
                      className={
                        item.financeStatus === 'Validated'
                          ? 'bg-[#004A99] hover:bg-[#003d7a] text-white shadow-sm'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                      }
                      onClick={() =>
                        onInlineEdit(
                          item.id,
                          'financeStatus',
                          item.financeStatus === 'Validated' ? 'Pending' : 'Validated',
                        )
                      }
                    >
                      {item.financeStatus === 'Validated' ? 'Validado' : 'Pendente'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-[11px] leading-tight text-slate-500 whitespace-nowrap min-w-[120px]">
                    {item.lastEditedBy ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{item.lastEditedBy}</span>
                        <span>{new Date(item.lastEditedAt!).toLocaleString('pt-BR')}</span>
                      </div>
                    ) : (
                      <span className="italic text-slate-400">Sem edições</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right p-2">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100">
                      {item.validationStatus === 'Pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onInlineEdit(item.id, 'validationStatus', 'Validated')}
                          className="h-8 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 print:hidden"
                        >
                          Validar
                        </Button>
                      )}
                      {item.type === 'Equipamento' && onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="h-8 print:hidden"
                          title="Ficha de Ativo"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                        className="h-8 w-8 hover:text-red-600 hover:bg-red-50 print:hidden"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
