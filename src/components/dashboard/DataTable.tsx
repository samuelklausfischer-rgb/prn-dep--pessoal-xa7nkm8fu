import { useState } from 'react'
import { Trash2, FileText, CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DashboardItem } from '@/types'
import { calculateItemStatus, sortItemsByPriorityAndDate } from '@/lib/dashboard-utils'

interface DataTableProps {
  items: DashboardItem[]
  onInlineEdit: (id: string, field: keyof DashboardItem, value: any) => void
  onDelete: (id: string) => void
  onViewDetails?: (item: DashboardItem) => void
}

export function DataTable({ items, onInlineEdit, onDelete, onViewDetails }: DataTableProps) {
  const sortedItems = sortItemsByPriorityAndDate(items)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { role } = useAuth()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedItems.map((i) => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const handleBatchValidate = () => {
    selectedIds.forEach((id) => {
      onInlineEdit(id, 'status', 'Validated by Finance')
    })
    toast({
      title: 'Validação em Lote',
      description: `${selectedIds.size} registros foram validados com sucesso.`,
    })
    setSelectedIds(new Set())
  }

  const getStatusBadge = (dueDate: string) => {
    const status = calculateItemStatus(dueDate)
    if (status === 'critical')
      return (
        <Badge className="bg-red-500 hover:bg-red-600 animate-pulse-soft border-transparent text-white">
          Crítico 🔴
        </Badge>
      )
    if (status === 'warning')
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent text-white">
          Atenção 🟠
        </Badge>
      )
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white">
        Regular 🟢
      </Badge>
    )
  }

  const getWeightBadge = (weight: number) => {
    if (weight === 3)
      return <Badge className="bg-red-50 text-red-700 border-red-200">Alta (3)</Badge>
    if (weight === 2)
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Média (2)</Badge>
    return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Baixa (1)</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const map: Record<string, string> = {
      'Technical Asset': 'Ativo Técnico',
      'Human Capital': 'Capital Humano',
      'Legal Documentation': 'Doc. Legal',
    }
    return (
      <Badge variant="secondary" className="font-normal bg-slate-100 whitespace-nowrap">
        {map[category] || category}
      </Badge>
    )
  }

  return (
    <Card className="glass-panel overflow-hidden animate-fade-in-up print:shadow-none print:border-none print:bg-transparent">
      {selectedIds.size > 0 && role === 'Financeiro' && (
        <div className="bg-[#002D5F]/5 border-b border-[#002D5F]/10 p-3 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-medium text-[#002D5F]">
            {selectedIds.size}{' '}
            {selectedIds.size === 1 ? 'registro selecionado' : 'registros selecionados'}
          </span>
          <Button
            size="sm"
            onClick={handleBatchValidate}
            className="bg-[#002D5F] hover:bg-[#004A99] text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validar Selecionados
          </Button>
        </div>
      )}
      <div className="overflow-x-auto print:overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent whitespace-nowrap">
              {role === 'Financeiro' && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={selectedIds.size === sortedItems.length && sortedItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="w-[20%] min-w-[200px]">Registro</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Fluxo (Status)</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={role === 'Financeiro' ? 8 : 7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={`group transition-colors hover:bg-slate-50/50 ${selectedIds.has(item.id) ? 'bg-[#002D5F]/5' : ''}`}
                >
                  {role === 'Financeiro' && (
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium p-1">
                    <div className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => onInlineEdit(item.id, 'name', e.target.value)}
                        className="border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white h-9 shadow-none focus-visible:ring-1 min-w-[150px]"
                      />
                    </div>
                    <div className="px-3 text-[11px] text-slate-500 font-normal">{item.unit}</div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(item.category)}</TableCell>
                  <TableCell>{getWeightBadge(item.weight)}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onValueChange={(val) => onInlineEdit(item.id, 'status', val)}
                    >
                      <SelectTrigger className="h-8 text-[11px] font-medium w-[150px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Extracted (IA)">Extraído (IA)</SelectItem>
                        <SelectItem value="Pending Conference">Pend. Conferência</SelectItem>
                        <SelectItem value="Validated by Finance">Validado Financeiro</SelectItem>
                        <SelectItem value="Completed/Archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => onInlineEdit(item.id, 'dueDate', e.target.value)}
                      className="border-transparent bg-transparent hover:bg-white hover:border-slate-200 focus:bg-white h-9 w-auto min-w-[130px] shadow-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell>{getStatusBadge(item.dueDate)}</TableCell>
                  <TableCell className="text-right p-2">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100">
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="h-8 print:hidden"
                          title="Abrir Ficha e Notas"
                        >
                          <FileText className="h-4 w-4 mr-1" /> Ficha
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
