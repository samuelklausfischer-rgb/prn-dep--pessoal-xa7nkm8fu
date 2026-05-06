import { useEffect, useState } from 'react'
import {
  Activity,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { differenceInDays, parseISO, format, isBefore, startOfDay } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  getComplianceDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  Document,
} from '@/services/documents'
import { getUnits } from '@/services/personnel'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function Exams() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Partial<Document>>({})
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const loadData = async () => {
    setLoading(true)
    try {
      const [dList, uList] = await Promise.all([getComplianceDocuments(), getUnits()])
      setDocuments(dList)
      setUnits(uList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('documents', () => loadData())

  const handleSave = async () => {
    const payload = { ...form }
    if (payload.due_date) payload.due_date = new Date(payload.due_date).toISOString()

    if (form.id) await updateDocument(form.id, payload)
    else
      await createDocument({
        ...payload,
        status: payload.status || 'pending',
        workflow_status: 'Pending Conference',
      } as any)
    setDialogOpen(false)
  }

  const today = startOfDay(new Date())
  const getUrgency = (dueDate?: string, status?: string) => {
    if (status === 'validated') return 'green'
    if (!dueDate) return 'gray'
    const date = startOfDay(parseISO(dueDate))
    if (isBefore(date, today)) return 'red'
    if (differenceInDays(date, today) <= 30) return 'amber'
    return 'green'
  }

  const formatD = (d?: string) => {
    if (!d) return '-'
    try {
      return format(parseISO(d), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

  const filtered = documents.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.type === typeFilter
    const matchUnit = unitFilter === 'all' || d.unit === unitFilter
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchType && matchUnit && matchStatus
  })

  const kpiVencidos = documents.filter((d) => getUrgency(d.due_date, d.status) === 'red').length
  const kpiVencer = documents.filter((d) => getUrgency(d.due_date, d.status) === 'amber').length
  const kpiTreinamentos = documents.filter(
    (d) => d.type === 'Treinamento' && d.status !== 'validated',
  ).length

  const getStatusBadge = (status: string) => {
    if (status === 'validated')
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Validado</Badge>
      )
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pendente</Badge>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Exames & Treinamentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de Conformidade e Saúde Ocupacional.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setForm({ type: 'Exame' })
              setDialogOpen(true)
            }}
            className="bg-sky-600 hover:bg-sky-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Registro
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Vencidos</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{kpiVencidos}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">A Vencer (30 dias)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{kpiVencer}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Treinamentos Pendentes</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{kpiTreinamentos}</h3>
            </div>
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-slate-50/50 rounded-t-xl">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por colaborador ou documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="Exame">Exame Médico</SelectItem>
              <SelectItem value="Treinamento">Treinamento</SelectItem>
              <SelectItem value="Certificação">Certificação</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Unidades</SelectItem>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="validated">Validado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[30%]">Colaborador / Doc.</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <FileText className="h-10 w-10 mb-2 opacity-20" />
                      <p>Nenhum registro encontrado com os filtros atuais.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => {
                  const urgencyColor = getUrgency(d.due_date, d.status)
                  return (
                    <TableRow key={d.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{d.title}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {d.type === 'Exame' && <Activity className="h-3.5 w-3.5 text-blue-500" />}
                          {d.type === 'Treinamento' && (
                            <CheckCircle className="h-3.5 w-3.5 text-purple-500" />
                          )}
                          {d.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            urgencyColor === 'red' &&
                              'bg-red-50 text-red-700 border-red-200 font-semibold',
                            urgencyColor === 'amber' &&
                              'bg-amber-50 text-amber-700 border-amber-200 font-medium',
                            urgencyColor === 'green' &&
                              'bg-emerald-50 text-emerald-700 border-emerald-200',
                            urgencyColor === 'gray' &&
                              'bg-slate-50 text-slate-700 border-slate-200',
                          )}
                        >
                          {urgencyColor === 'red' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {formatD(d.due_date)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-medium">
                        {d.expand?.unit?.name || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(d.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {(isAdmin || role === 'financeiro') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-900"
                              onClick={() => {
                                setForm(d)
                                setDialogOpen(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Editar Registro' : 'Novo Registro de Conformidade'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>
                Colaborador / Nome do Documento <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={!isAdmin && role !== 'financeiro'}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.type || ''}
                onValueChange={(v) => setForm({ ...form, type: v })}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exame">Exame Médico</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Certificação">Certificação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status de Validação</Label>
              <Select
                value={form.status || ''}
                onValueChange={(v) => setForm({ ...form, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="validated">Validado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={form.unit || ''}
                onValueChange={(v) => setForm({ ...form, unit: v })}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={form.due_date?.substring(0, 10) || ''}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center w-full">
            {isAdmin && form.id ? (
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  deleteDocument(form.id!)
                  setDialogOpen(false)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-sky-600 hover:bg-sky-700 text-white">
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
