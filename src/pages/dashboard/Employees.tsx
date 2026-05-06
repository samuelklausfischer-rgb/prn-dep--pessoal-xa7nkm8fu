import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCircle,
  Briefcase,
  Eye,
  Info,
} from 'lucide-react'
import {
  getPersonnelList,
  getUnits,
  updatePersonnel,
  deletePersonnel,
  createPersonnel,
  Personnel,
} from '@/services/personnel'
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
import { parseISO, format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export default function Employees() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [workflowFilter, setWorkflowFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<Partial<Personnel>>({})
  const [selectedColab, setSelectedColab] = useState<Personnel | null>(null)

  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const loadData = async () => {
    setLoading(true)
    try {
      const [pList, uList] = await Promise.all([getPersonnelList(), getUnits()])
      setPersonnel(pList)
      setUnits(uList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('personnel', () => loadData())

  const handleSave = async () => {
    const payload = { ...form }
    if (payload.admission_date)
      payload.admission_date = new Date(payload.admission_date).toISOString()
    if (payload.probation_45) payload.probation_45 = new Date(payload.probation_45).toISOString()
    if (payload.probation_90) payload.probation_90 = new Date(payload.probation_90).toISOString()

    if (form.id) await updatePersonnel(form.id, payload)
    else
      await createPersonnel({
        ...payload,
        workflow_status: 'Extracted (IA)',
        status: 'active',
      } as any)
    setDialogOpen(false)
  }

  const formatD = (d?: string) => {
    if (!d) return '-'
    try {
      return format(parseISO(d), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

  const filtered = personnel.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.role?.toLowerCase() || '').includes(search.toLowerCase())
    const matchUnit = unitFilter === 'all' || p.unit === unitFilter
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchWorkflow = workflowFilter === 'all' || p.workflow_status === workflowFilter
    return matchSearch && matchUnit && matchStatus && matchWorkflow
  })

  const total = personnel.length
  const ativos = personnel.filter((p) => p.status === 'active').length
  const pendencias = personnel.filter((p) => p.workflow_status !== 'Completed/Archived').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
            Ativo
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
            Pendente
          </Badge>
        )
      case 'inactive':
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
            Inativo
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getWorkflowBadge = (ws: string) => {
    if (ws === 'Extracted (IA)')
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Extraído (IA)
        </Badge>
      )
    if (ws === 'Pending Conference')
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
          Pend. Conferência
        </Badge>
      )
    if (ws === 'Validated by Finance')
      return (
        <Badge variant="secondary" className="bg-sky-100 text-sky-700">
          Validado
        </Badge>
      )
    if (ws === 'Completed/Archived')
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Arquivado
        </Badge>
      )
    return <Badge variant="outline">{ws}</Badge>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Colaboradores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão centralizada de departamento pessoal e conformidade.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setForm({})
              setDialogOpen(true)
            }}
            className="bg-sky-600 hover:bg-sky-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Colaborador
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-sky-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Colaboradores</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{total}</h3>
            </div>
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ativos</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{ativos}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <UserCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendências</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{pendencias}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-slate-50/50 rounded-t-xl">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
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
              <SelectValue placeholder="Status RH" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Situação (Workflow)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Situações</SelectItem>
              <SelectItem value="Extracted (IA)">Extraído (IA)</SelectItem>
              <SelectItem value="Pending Conference">Pend. Conferência</SelectItem>
              <SelectItem value="Validated by Finance">Validado Financeiro</SelectItem>
              <SelectItem value="Completed/Archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[30%]">Colaborador</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status RH</TableHead>
                <TableHead>Situação</TableHead>
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
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[120px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Users className="h-10 w-10 mb-2 opacity-20" />
                      <p>Nenhum colaborador encontrado com os filtros atuais.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase className="h-3 w-3" /> {p.role || 'Sem cargo'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 font-medium">
                      {p.expand?.unit?.name || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell>{getWorkflowBadge(p.workflow_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                          onClick={() => {
                            setSelectedColab(p)
                            setDrawerOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
                        </Button>
                        {(isAdmin || role === 'financeiro') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            onClick={() => {
                              setForm(p)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
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

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <div className="mx-auto w-full max-w-2xl overflow-auto p-6">
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  {selectedColab?.name?.charAt(0).toUpperCase() || (
                    <UserCircle className="h-6 w-6" />
                  )}
                </div>
                {selectedColab?.name}
              </DrawerTitle>
              <DrawerDescription>Detalhes completos e histórico do colaborador</DrawerDescription>
            </DrawerHeader>

            {selectedColab && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" /> Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <span className="text-slate-500">Cargo:</span>
                    <span className="font-medium text-slate-900">{selectedColab.role || '-'}</span>

                    <span className="text-slate-500">Unidade:</span>
                    <span className="font-medium text-slate-900">
                      {selectedColab.expand?.unit?.name || '-'}
                    </span>

                    <span className="text-slate-500">Status RH:</span>
                    <span>{getStatusBadge(selectedColab.status)}</span>

                    <span className="text-slate-500">Admissão:</span>
                    <span className="font-medium text-slate-900">
                      {formatD(selectedColab.admission_date)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-slate-400" /> Prazos de Experiência
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <span className="text-slate-500">Exp. 45 dias:</span>
                    <span className="font-medium text-slate-900">
                      {formatD(selectedColab.probation_45)}
                    </span>

                    <span className="text-slate-500">Exp. 90 dias:</span>
                    <span className="font-medium text-slate-900">
                      {formatD(selectedColab.probation_90)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2 bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Status Operacional</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Fluxo de Validação:</span>
                      <span>{getWorkflowBadge(selectedColab.workflow_status)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Observações:</span>
                      <span className="font-medium text-slate-900">
                        {selectedColab.observations || 'Nenhuma observação registrada.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DrawerFooter className="px-0 pb-0">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                disabled={!isAdmin}
              />
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
              <Label>Status RH</Label>
              <Select
                value={form.status || ''}
                onValueChange={(v) => setForm({ ...form, status: v as any })}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do Fluxo de Validação</Label>
              <Select
                value={form.workflow_status || ''}
                onValueChange={(v) => setForm({ ...form, workflow_status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Extracted (IA)">Extraído (IA)</SelectItem>
                  <SelectItem value="Pending Conference">Pend. Conferência</SelectItem>
                  <SelectItem value="Validated by Finance">Validado Financeiro</SelectItem>
                  <SelectItem value="Completed/Archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Admissão</Label>
              <Input
                type="date"
                value={form.admission_date?.substring(0, 10) || ''}
                onChange={(e) => setForm({ ...form, admission_date: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento Exp. 45d</Label>
              <Input
                type="date"
                value={form.probation_45?.substring(0, 10) || ''}
                onChange={(e) => setForm({ ...form, probation_45: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento Exp. 90d</Label>
              <Input
                type="date"
                value={form.probation_90?.substring(0, 10) || ''}
                onChange={(e) => setForm({ ...form, probation_90: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Observações</Label>
              <Input
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                disabled={!isAdmin}
                placeholder="Notas ou informações adicionais"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center w-full">
            {isAdmin && form.id ? (
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  deletePersonnel(form.id!)
                  setDialogOpen(false)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir Registro
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
