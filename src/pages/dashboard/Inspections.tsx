import { useEffect, useState, useMemo } from 'react'
import { Wrench, Search, AlertCircle, CalendarDays, Clock, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { getInspections, type Inspection } from '@/services/inspections'
import { useRealtime } from '@/hooks/use-realtime'
import { format, isPast, isToday } from 'date-fns'

export default function Inspections() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInsp, setSelectedInsp] = useState<Inspection | null>(null)

  const loadData = async () => {
    try {
      const data = await getInspections()
      setInspections(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('inspections', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      const matchesSearch =
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.expand?.unit?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [inspections, searchTerm, statusFilter])

  const total = inspections.length
  const overdueCount = inspections.filter(
    (i) =>
      i.status === 'overdue' ||
      (i.scheduled_date &&
        isPast(new Date(i.scheduled_date)) &&
        !isToday(new Date(i.scheduled_date)) &&
        i.status === 'pending'),
  ).length
  const criticalCount = inspections.filter((i) => i.criticality === 'high').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500">Concluída</Badge>
      case 'pending':
        return <Badge className="bg-amber-500">Pendente</Badge>
      case 'overdue':
        return <Badge variant="destructive">Atrasada</Badge>
      default:
        return <Badge variant="secondary">Planejada</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-[#002D5F]">
          <Wrench className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Vistorias Técnicas</h1>
            <p className="text-slate-500 text-sm">
              Controles de calibração, manutenção e licenciamento de máquinas.
            </p>
          </div>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700">+ Nova Vistoria</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Vistorias</CardTitle>
            <CalendarDays className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Vistorias Atrasadas
            </CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Itens Críticos</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{criticalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar vistoria ou unidade..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="planned">Planejada</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="overdue">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título / Tipo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Data Agendada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhuma vistoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((insp) => (
                  <TableRow key={insp.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{insp.title}</div>
                      <div className="text-xs text-slate-500">{insp.type}</div>
                    </TableCell>
                    <TableCell>{insp.expand?.unit?.name || '-'}</TableCell>
                    <TableCell>
                      {insp.scheduled_date
                        ? format(new Date(insp.scheduled_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(insp.status)}</TableCell>
                    <TableCell>
                      {insp.criticality === 'high' ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <AlertCircle className="h-3 w-3" /> Alta
                        </span>
                      ) : insp.criticality === 'medium' ? (
                        <span className="text-amber-600 text-sm">Média</span>
                      ) : (
                        <span className="text-emerald-600 text-sm">Baixa</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedInsp(insp)}>
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={!!selectedInsp} onOpenChange={(o) => !o && setSelectedInsp(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle className="text-2xl">{selectedInsp?.title}</DrawerTitle>
              <DrawerDescription>Detalhes da Vistoria Técnica</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <div>{selectedInsp && getStatusBadge(selectedInsp.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Criticidade</p>
                  <p className="text-sm font-medium capitalize">{selectedInsp?.criticality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Unidade</p>
                  <p className="text-sm">{selectedInsp?.expand?.unit?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tipo</p>
                  <p className="text-sm">{selectedInsp?.type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Data Agendada</p>
                  <p className="text-sm">
                    {selectedInsp?.scheduled_date
                      ? format(new Date(selectedInsp.scheduled_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Inspetor/Responsável</p>
                  <p className="text-sm">{selectedInsp?.inspector || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Anotações</p>
                <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-700 min-h-20 whitespace-pre-wrap">
                  {selectedInsp?.notes || 'Nenhuma anotação.'}
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button className="w-full bg-sky-600 hover:bg-sky-700">Editar Vistoria</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
