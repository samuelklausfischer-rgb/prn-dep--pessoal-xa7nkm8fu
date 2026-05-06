import { useEffect, useState } from 'react'
import { Users, Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
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
import { differenceInDays, parseISO, format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Employees() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Partial<Personnel>>({})
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const loadData = async () => {
    const [pList, uList] = await Promise.all([getPersonnelList(), getUnits()])
    setPersonnel(pList)
    setUnits(uList)
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

  const filtered = personnel.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase()),
  )
  const isNear = (d?: string) =>
    d
      ? differenceInDays(parseISO(d), new Date()) >= 0 &&
        differenceInDays(parseISO(d), new Date()) <= 30
      : false
  const formatD = (d?: string) => (d ? format(parseISO(d), 'dd/MM/yyyy') : '-')

  const kpis = [
    {
      label: 'Ativos',
      value: personnel.filter((p) => p.status === 'active').length,
      c: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Pendentes Docs',
      value: personnel.filter((p) => p.workflow_status === 'Pending Conference').length,
      c: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Vencimentos Exp.',
      value: personnel.filter((p) => isNear(p.probation_45) || isNear(p.probation_90)).length,
      c: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: 'Novas Admissões',
      value: personnel.filter(
        (p) => p.admission_date && differenceInDays(new Date(), parseISO(p.admission_date)) <= 30,
      ).length,
      c: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#002D5F]">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Colaboradores</h1>
            <p className="text-sm text-slate-500">Gestão de Departamento Pessoal</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setForm({})
              setDialogOpen(true)
            }}
            className="bg-[#002D5F]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full ${k.bg} ${k.c}`}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{k.label}</p>
                <h3 className="text-2xl font-bold">{k.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b flex gap-4">
          <Input
            placeholder="Buscar por nome ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Exp. 45d</TableHead>
              <TableHead>Exp. 90d</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.role}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {p.expand?.unit?.name || '-'}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {formatD(p.admission_date)}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm flex items-center ${isNear(p.probation_45) ? 'text-red-600 font-bold' : 'text-slate-600'}`}
                  >
                    {formatD(p.probation_45)}{' '}
                    {isNear(p.probation_45) && <AlertTriangle className="h-3 w-3 ml-1" />}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm flex items-center ${isNear(p.probation_90) ? 'text-red-600 font-bold' : 'text-slate-600'}`}
                  >
                    {formatD(p.probation_90)}{' '}
                    {isNear(p.probation_90) && <AlertTriangle className="h-3 w-3 ml-1" />}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm(p)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => deletePersonnel(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
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
                  <SelectValue />
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Status do Fluxo de Validação</Label>
              <Select
                value={form.workflow_status || ''}
                onValueChange={(v) => setForm({ ...form, workflow_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Extracted (IA)">Extraído (IA)</SelectItem>
                  <SelectItem value="Pending Conference">Pendente Conferência</SelectItem>
                  <SelectItem value="Validated by Finance">Validado pelo Financeiro</SelectItem>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#002D5F]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
