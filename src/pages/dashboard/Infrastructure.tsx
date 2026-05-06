import { useState, useEffect } from 'react'
import {
  Building,
  Plus,
  Search,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  Wrench,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { getAssets, getUnits, deleteAsset } from '@/services/assets'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

const INFRA_CATEGORIES = [
  'Elétrica',
  'Hidráulica',
  'Predial',
  'Climatização',
  'Segurança',
  'Infraestrutura',
]

export default function Infrastructure() {
  const [assets, setAssets] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterUnit, setFilterUnit] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [assetsData, unitsData] = await Promise.all([getAssets(), getUnits()])
      const infraAssets = assetsData.filter(
        (a) =>
          INFRA_CATEGORIES.includes(a.category) || a.category?.toLowerCase() === 'infraestrutura',
      )
      setAssets(infraAssets)
      setUnits(unitsData)
    } catch (e: any) {
      toast({ title: 'Erro ao carregar dados', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('assets', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta estrutura?')) return
    try {
      await deleteAsset(id)
      toast({ title: 'Estrutura removida' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao remover', description: e.message, variant: 'destructive' })
    }
  }

  const filteredAssets = assets.filter((a) => {
    if (filterUnit !== 'all' && a.unit !== filterUnit) return false
    if (filterCategory !== 'all' && a.category !== filterCategory) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!a.name?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const criticalItems = assets.filter((a) => a.status === 'offline' || a.weight === 3).length
  const pendingMaintenance = assets.filter((a) => a.status === 'maintenance').length
  const unitsWithAlerts = new Set(
    assets.filter((a) => a.status !== 'operational' && a.unit).map((a) => a.unit),
  ).size

  const openDrawer = (asset: any = null) => {
    setSelectedAsset(asset)
    setIsDrawerOpen(true)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'operational')
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent">Regular 🟢</Badge>
      )
    if (status === 'maintenance')
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent">Manutenção 🟡</Badge>
      )
    if (status === 'offline')
      return (
        <Badge className="bg-red-500 hover:bg-red-600 border-transparent animate-pulse-soft">
          Crítico 🔴
        </Badge>
      )
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600">
        Não definido
      </Badge>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#002D5F]">
          <Building className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Infraestrutura Física</h1>
            <p className="text-sm text-slate-500">Monitoramento da saúde estrutural das unidades</p>
          </div>
        </div>
        <Button onClick={() => openDrawer()} className="bg-[#002D5F] hover:bg-[#004A99]">
          <Plus className="h-4 w-4 mr-2" /> Nova Estrutura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pontos Críticos</p>
              <h3 className="text-2xl font-bold text-slate-800">{criticalItems}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pendentes de Manutenção</p>
              <h3 className="text-2xl font-bold text-slate-800">{pendingMaintenance}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unidades com Alertas</p>
              <h3 className="text-2xl font-bold text-slate-800">{unitsWithAlerts}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome da estrutura..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Select value={filterUnit} onValueChange={setFilterUnit}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Unidades</SelectItem>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="operational">Regular</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="offline">Crítico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {INFRA_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Building className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Nenhuma estrutura encontrada
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Nenhuma estrutura corresponde aos filtros, ou inicie cadastrando um novo ponto.
            </p>
            <Button onClick={() => openDrawer()} variant="outline">
              Cadastrar Estrutura
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[30%]">Estrutura / Ponto</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Saúde</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 group">
                    <TableCell>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                        {item.responsible_company || 'Manutenção Interna'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">
                        {item.expand?.unit?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {item.category || 'Geral'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      {item.weight === 3 && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none">
                          Alto (3)
                        </Badge>
                      )}
                      {item.weight === 2 && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none">
                          Atenção (2)
                        </Badge>
                      )}
                      {(item.weight === 1 || !item.weight) && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">
                          Baixo (1)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => openDrawer(item)}>
                            Editar / Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AssetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        asset={selectedAsset}
        units={units}
        mode="infrastructure"
        onSaveComplete={loadData}
      />
    </div>
  )
}
