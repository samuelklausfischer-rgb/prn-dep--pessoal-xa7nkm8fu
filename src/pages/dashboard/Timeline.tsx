import { useEffect, useState } from 'react'
import { Clock, AlertCircle, Info, AlertTriangle, ArrowRight, Search } from 'lucide-react'
import { getSystemEvents, SystemEvent } from '@/services/system_events'
import { getUnits } from '@/services/personnel'
import { useRealtime } from '@/hooks/use-realtime'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'

export default function Timeline() {
  const [events, setEvents] = useState<SystemEvent[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterUnit, setFilterUnit] = useState('all')
  const [filterSev, setFilterSev] = useState('all')
  const navigate = useNavigate()

  const loadData = async () => {
    const [evs, uns] = await Promise.all([getSystemEvents(), getUnits()])
    setEvents(evs)
    setUnits(uns)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('system_events', () => {
    loadData()
  })

  const filtered = events.filter((e) => {
    const mSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase())
    const mUnit = filterUnit === 'all' || e.unit === filterUnit
    const mSev = filterSev === 'all' || e.severity === filterSev
    return mSearch && mUnit && mSev
  })

  const getIcon = (sev: string) => {
    if (sev === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />
    if (sev === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />
    return <Info className="h-5 w-5 text-blue-500" />
  }

  const getBorder = (sev: string) => {
    if (sev === 'critical') return 'border-red-500'
    if (sev === 'warning') return 'border-amber-500'
    return 'border-blue-500'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-[#002D5F]">
          <Clock className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Linha do Tempo</h1>
            <p className="text-sm text-slate-500">
              Histórico cronológico de movimentações e alertas
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4 mb-8 glass-panel grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar evento..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterUnit} onValueChange={setFilterUnit}>
          <SelectTrigger>
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
        <Select value={filterSev} onValueChange={setFilterSev}>
          <SelectTrigger>
            <SelectValue placeholder="Gravidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="info">Informação</SelectItem>
            <SelectItem value="warning">Aviso / Atenção</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <div className="border-l-2 border-slate-200 ml-4 pl-6 space-y-6 relative pb-10">
        {filtered.map((e) => (
          <div key={e.id} className="relative animate-fade-in-up">
            <div
              className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-white ${getBorder(e.severity)}`}
            >
              <div
                className={`w-full h-full rounded-full ${e.severity === 'critical' ? 'bg-red-500' : e.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
              />
            </div>
            <Card
              className={`p-5 transition-all hover:shadow-md ${e.severity === 'critical' ? 'border-red-200 bg-red-50/50' : e.severity === 'warning' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getIcon(e.severity)}
                  <span className="font-semibold text-slate-800 tracking-tight">
                    {e.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  {format(parseISO(e.created), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>
              <p className="mt-3 text-slate-600 font-medium">{e.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded">
                  📍 {e.expand?.unit?.name || 'Sistema Global'}
                </span>
                {e.entity_type === 'personnel' && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-[#004A99] font-bold"
                    onClick={() => navigate('/dashboard/employees')}
                  >
                    Acessar Registro <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center animate-fade-in">
            <Clock className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Nenhuma movimentação encontrada</h3>
            <p className="text-slate-500 mt-1">Ajuste os filtros para ver mais resultados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
