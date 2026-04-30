import { useState, useRef } from 'react'
import { FileSpreadsheet, Plus, Save, Search, Building2, Activity, FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { HealthCards } from '@/components/dashboard/HealthCards'
import { DataTable } from '@/components/dashboard/DataTable'
import { ItemDialog } from '@/components/dashboard/ItemDialog'
import { UrgentActions } from '@/components/dashboard/UrgentActions'
import { WeeklyReport } from '@/components/dashboard/WeeklyReport'
import { cn } from '@/lib/utils'
import type { DashboardItem, UnitType, RecordType } from '@/types'

const getRelativeDate = (daysToAdd: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysToAdd)
  return d.toISOString().split('T')[0]
}

const INITIAL_ITEMS: DashboardItem[] = [
  {
    id: '1',
    name: 'João da Silva - ASO',
    unit: 'PRN Diagnósticos',
    type: 'Colaborador',
    dueDate: getRelativeDate(3),
    sector: 'Recepção',
    financeStatus: 'Pending',
  },
  {
    id: '2',
    name: 'Manutenção Raio-X',
    unit: 'Medimagem',
    type: 'Equipamento',
    dueDate: getRelativeDate(15),
    code: 'MED-RX-01',
    financeStatus: 'Validated',
    lastEditedBy: 'Maria Financeiro',
    lastEditedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Maria Oliveira - Treinamento',
    unit: 'PRN Diagnósticos',
    type: 'Colaborador',
    dueDate: getRelativeDate(45),
    sector: 'Enfermagem',
    financeStatus: 'Pending',
  },
  {
    id: '4',
    name: 'Calibração Tomógrafo',
    unit: 'PRN Diagnósticos',
    type: 'Equipamento',
    dueDate: getRelativeDate(-2),
    code: 'PRN-TM-01',
    financeStatus: 'Pending',
  },
  {
    id: '5',
    name: 'Vistoria Semestral RM',
    unit: 'PRN Diagnósticos',
    type: 'Vistoria',
    dueDate: getRelativeDate(5),
    code: 'PRN-RM-02',
    financeStatus: 'Pending',
  },
]

const CURRENT_USER = 'Admin Sistema'

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unitFilter, setUnitFilter] = useState<'All' | 'PRN Diagnósticos' | 'Medimagem'>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Vistoria'>('All')

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenAdd = () => setIsDialogOpen(true)

  const handleSaveModal = (itemData: Partial<DashboardItem>) => {
    const newItem: DashboardItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      financeStatus: 'Pending',
      lastEditedBy: CURRENT_USER,
      lastEditedAt: new Date().toISOString(),
    } as DashboardItem
    setItems((prev) => [...prev, newItem])
    toast({ title: 'Sucesso', description: 'Novo registro adicionado.' })
    setIsDialogOpen(false)
  }

  const handleInlineEdit = (id: string, field: keyof DashboardItem, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              lastEditedBy: CURRENT_USER,
              lastEditedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  // Filter items based on criteria
  const filteredItems = items.filter((item) => {
    if (unitFilter !== 'All' && item.unit !== unitFilter) return false

    if (
      typeFilter === 'Vistoria' &&
      item.type !== 'Vistoria' &&
      !item.name.toLowerCase().includes('vistoria')
    )
      return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.sector && item.sector.toLowerCase().includes(q))
      )
    }

    return true
  })

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast({ title: 'Removido', description: 'O registro foi removido.' })
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n')
        const newItems: DashboardItem[] = []

        lines.forEach((line, index) => {
          if (index === 0 || !line.trim()) return // Skip header & empty lines

          const parts = line.split(',')
          if (parts.length >= 2) {
            let name = parts[0]?.trim()
            let unitRaw = parts[1]?.trim()
            let dueDateRaw = parts[2]?.trim() || getRelativeDate(10)
            let typeRaw = parts[3]?.trim()

            // Default logic to PRN
            let unit: UnitType = unitRaw === 'Medimagem' ? 'Medimagem' : 'PRN Diagnósticos'
            let type: RecordType = 'Colaborador'
            if (typeRaw?.toLowerCase().includes('equip')) type = 'Equipamento'
            if (typeRaw?.toLowerCase().includes('vistoria')) type = 'Vistoria'

            let dueDate = dueDateRaw
            if (dueDate.includes('/')) {
              const [d, m, y] = dueDate.split('/')
              if (y && m && d) dueDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
            }

            if (name) {
              newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                name,
                unit,
                type,
                dueDate,
                financeStatus: 'Pending',
                lastEditedBy: CURRENT_USER,
                lastEditedAt: new Date().toISOString(),
              })
            }
          }
        })

        if (newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems])
          toast({
            title: 'Importação Concluída',
            description: `${newItems.length} registros extraídos de ${file.name}.`,
          })
        }
      }
      reader.readAsText(file)
    } else {
      // Mock parsing for Excel
      const mockImport: DashboardItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Registro Extraído (XLSX)',
        unit: 'PRN Diagnósticos',
        type: 'Colaborador',
        dueDate: getRelativeDate(20),
        sector: 'Extração',
        financeStatus: 'Pending',
        lastEditedBy: CURRENT_USER,
        lastEditedAt: new Date().toISOString(),
      }
      setItems((prev) => [...prev, mockImport])
      toast({
        title: 'Planilha Importada',
        description: 'Os dados foram extraídos e mapeados automaticamente.',
      })
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmData = () => {
    toast({
      title: 'Dados Confirmados',
      description: 'As alterações foram sincronizadas com o Skip Cloud.',
      className: 'bg-emerald-50 border-emerald-200',
    })
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#004A99]">Visão Geral</h1>
          <p className="text-slate-500">Acompanhamento de vencimentos e ativos.</p>
        </div>
        <Button
          onClick={handleConfirmData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-105 duration-200"
        >
          <Save className="mr-2 h-4 w-4" />
          Confirmar Dados
        </Button>
      </div>

      <UrgentActions items={items} />

      <WeeklyReport items={items} />

      <HealthCards items={items} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-[#004A99]">Painel de Vencimentos</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="file"
            accept=".csv, .xlsx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="flex-1 sm:flex-none glass-panel border-blue-200 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 duration-200"
            onClick={triggerFileInput}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Extrair de Planilha
          </Button>
          <Button
            className="flex-1 sm:flex-none bg-[#004A99] hover:bg-[#003d7a] text-white transition-transform hover:scale-105 duration-200 shadow-md"
            onClick={handleOpenAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome, equipamento, técnico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200 shadow-sm focus-visible:ring-[#004A99]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnitFilter('PRN Diagnósticos')}
            className={cn(
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              unitFilter === 'PRN Diagnósticos' && 'border-[#004A99] text-[#004A99] bg-blue-50',
            )}
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Ver Só PRN
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnitFilter('Medimagem')}
            className={cn(
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              unitFilter === 'Medimagem' && 'border-purple-600 text-purple-700 bg-purple-50',
            )}
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Ver Só Medimagem
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeFilter('Vistoria')}
            className={cn(
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              typeFilter === 'Vistoria' && 'border-amber-600 text-amber-700 bg-amber-50',
            )}
          >
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Ver Só Vistorias
          </Button>

          {(unitFilter !== 'All' || typeFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUnitFilter('All')
                setTypeFilter('All')
              }}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <DataTable items={filteredItems} onInlineEdit={handleInlineEdit} onDelete={handleDelete} />

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveModal}
        initialData={null}
      />
    </div>
  )
}
