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
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900 animate-pulse-soft font-medium"
        >
          Crítico 🔴
        </Badge>
      )
    if (status === 'warning')
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900 font-medium"
        >
          Atenção 🟠
        </Badge>
      )
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900 font-medium"
      >
        Regular 🟢
      </Badge>
    )
  }

  const getWeightBadge = (weight: number) => {
    if (weight === 3)
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900 font-medium"
        >
          Alta (3)
        </Badge>
      )
    if (weight === 2)
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900 font-medium"
        >
          Média (2)
        </Badge>
      )
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900 font-medium"
      >
        Baixa (1)
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    const map: Record<string, string> = {
      'Technical Asset': 'Ativo Técnico',
      'Human Capital': 'Capital Humano',
      'Legal Documentation': 'Doc. Legal',
    }
    return (
      <Badge
        variant="secondary"
        className="font-medium bg-secondary text-secondary-foreground whitespace-nowrap border-border"
      >
        {map[category] || category}
      </Badge>
    )
  }

  return (
    <Card className="glass-panel premium-shadow overflow-hidden animate-fade-in-up print:shadow-none print:border-none print:bg-transparent">
      {selectedIds.size > 0 && role === 'financeiro' && (
        <div className="bg-primary/5 border-b border-primary/10 p-3 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size}{' '}
            {selectedIds.size === 1 ? 'registro selecionado' : 'registros selecionados'}
          </span>
          <Button size="sm" onClick={handleBatchValidate}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Validar Selecionados
          </Button>
        </div>
      )}
      <div className="overflow-x-auto print:overflow-visible">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent whitespace-nowrap border-border">
              {role === 'financeiro' && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={selectedIds.size === sortedItems.length && sortedItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="w-[20%] min-w-[200px] font-semibold">Registro</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Prioridade</TableHead>
              <TableHead className="font-semibold">Fluxo (Status)</TableHead>
              <TableHead className="font-semibold">Vencimento</TableHead>
              <TableHead className="font-semibold">Alerta</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={role === 'financeiro' ? 8 : 7}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 opacity-20 mb-3" />
                    <p>Nenhum registro encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={`group transition-colors duration-200 border-border hover:bg-muted/50 ${selectedIds.has(item.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  {role === 'financeiro' && (
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleSelectRow(item.id, c as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium p-3">
                    <div className="flex items-center gap-2">
                      {role === 'admin' ? (
                        <Input
                          value={item.name}
                          onChange={(e) => onInlineEdit(item.id, 'name', e.target.value)}
                          className="border-transparent bg-transparent hover:bg-background hover:border-border focus:bg-background h-9 shadow-none focus-visible:ring-1 min-w-[150px] transition-colors"
                        />
                      ) : (
                        <span className="px-3 py-1.5 truncate max-w-[200px] block text-foreground">
                          {item.name}
                        </span>
                      )}
                    </div>
                    <div className="px-3 text-[11px] text-muted-foreground font-normal tracking-wide uppercase mt-1">
                      {item.unit}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(item.category)}</TableCell>
                  <TableCell>{getWeightBadge(item.weight)}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onValueChange={(val) => onInlineEdit(item.id, 'status', val)}
                    >
                      <SelectTrigger className="h-8 text-[12px] font-medium w-[160px] bg-background border-border shadow-sm hover:bg-accent/50 transition-colors">
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
                  <TableCell className="p-2">
                    {role === 'admin' ? (
                      <Input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => onInlineEdit(item.id, 'dueDate', e.target.value)}
                        className="border-transparent bg-transparent hover:bg-background hover:border-border focus:bg-background h-9 w-auto min-w-[130px] shadow-none focus-visible:ring-1 transition-colors text-foreground"
                      />
                    ) : (
                      <span className="px-3 text-sm text-foreground">
                        {item.dueDate
                          ? new Date(item.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')
                          : '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.dueDate)}</TableCell>
                  <TableCell className="text-right p-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 print:opacity-100">
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="h-8 shadow-sm transition-colors hover:bg-accent print:hidden"
                          title="Abrir Ficha e Notas"
                        >
                          <FileText className="h-4 w-4 mr-1.5" /> Ficha
                        </Button>
                      )}
                      {role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors print:hidden"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
