import { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Plus,
  Search,
  FilterX,
  AlertCircle,
  Printer,
  BrainCircuit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { HealthCards } from '@/components/dashboard/HealthCards'
import { DataTable } from '@/components/dashboard/DataTable'
import { ItemDialog } from '@/components/dashboard/ItemDialog'
import { UrgentActions } from '@/components/dashboard/UrgentActions'
import { WeeklyReport } from '@/components/dashboard/WeeklyReport'
import { RecordDetailSheet } from '@/components/dashboard/RecordDetailSheet'
import { BICharts } from '@/components/dashboard/BICharts'
import { cn } from '@/lib/utils'
import type { DashboardItem, UnitType, RecordCategory } from '@/types'
import { calculateWeight } from '@/lib/dashboard-utils'

const getRelativeDate = (daysToAdd: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysToAdd)
  return d.toISOString().split('T')[0]
}

const INITIAL_ITEMS: DashboardItem[] = [
  {
    id: '1',
    name: 'Alvará de Funcionamento 2026',
    unit: 'PRN Diagnósticos',
    category: 'Legal Documentation',
    docType: 'Alvará',
    status: 'Pending Conference',
    weight: 3,
    dueDate: getRelativeDate(5),
    cost: 2500,
    notes: [],
  },
  {
    id: '2',
    name: 'Manutenção Tomógrafo RM',
    unit: 'Medimagem',
    category: 'Technical Asset',
    status: 'Validated by Finance',
    weight: 3,
    dueDate: getRelativeDate(15),
    cost: 8000,
    brand: 'GE Healthcare',
    serialNumber: 'TM-001',
    notes: [],
  },
  {
    id: '3',
    name: 'João Pedro - Admissão',
    unit: 'PRN Diagnósticos',
    category: 'Human Capital',
    status: 'Extracted (IA)',
    weight: 2,
    dueDate: getRelativeDate(45),
    role: 'Técnico Raio-X',
    cost: 0,
    notes: [
      {
        id: 'n1',
        text: 'Aguardando envio dos documentos admissionais.',
        user: 'RH',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: '4',
    name: 'Política Interna de Férias',
    unit: 'PRN Diagnósticos',
    category: 'Legal Documentation',
    docType: 'Internal Document',
    status: 'Completed/Archived',
    weight: 1,
    dueDate: getRelativeDate(120),
    cost: 0,
    notes: [],
  },
  {
    id: '5',
    name: 'Licença Sanitária',
    unit: 'Medimagem',
    category: 'Legal Documentation',
    docType: 'Sanitary License',
    status: 'Extracted (IA)',
    weight: 3,
    dueDate: getRelativeDate(-2),
    cost: 1500,
    notes: [],
  },
]

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DashboardItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [unitFilter, setUnitFilter] = useState<'All' | 'PRN Diagnósticos' | 'Medimagem'>('All')
  const [catFilter, setCatFilter] = useState<'All' | RecordCategory>('All')
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenAdd = () => setIsDialogOpen(true)

  const handleSaveModal = (itemData: Partial<DashboardItem>) => {
    const newItem: DashboardItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Extracted (IA)',
      weight: calculateWeight(itemData),
      notes: [],
      lastEditedBy: 'Gestor',
      lastEditedAt: new Date().toISOString(),
    } as DashboardItem
    setItems((prev) => [...prev, newItem])
    toast({ title: 'Adicionado ao Brain', description: 'Nova entidade processada e categorizada.' })
    setIsDialogOpen(false)
  }

  const handleInlineEdit = (id: string, field: keyof DashboardItem, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              lastEditedBy: 'Gestor',
              lastEditedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
    if (field === 'status' && value === 'Validated by Finance') {
      toast({ title: 'Status Atualizado', description: 'Registro validado pelo financeiro.' })
    }
  }

  const handleUpdateRecord = (id: string, updates: Partial<DashboardItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setSelectedRecord((prev) =>
      prev && prev.id === id ? ({ ...prev, ...updates } as DashboardItem) : prev,
    )
  }

  const filteredItems = items.filter((item) => {
    if (unitFilter !== 'All' && item.unit !== unitFilter) return false
    if (catFilter !== 'All' && item.category !== catFilter) return false
    if (showPendingOnly && item.status !== 'Pending Conference') return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item as any).docType?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast({ title: 'Removido', description: 'O registro foi removido do sistema.' })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const mockImport: DashboardItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Doc Extraído: ${file.name.substring(0, 10)}`,
      unit: unitFilter !== 'All' ? unitFilter : 'PRN Diagnósticos',
      category: 'Legal Documentation',
      docType: 'Internal Document',
      status: 'Extracted (IA)',
      weight: 1,
      dueDate: getRelativeDate(20),
      cost: 0,
      notes: [],
    }
    setItems((prev) => [...prev, mockImport])
    toast({
      title: 'Extração IA Concluída',
      description: 'Documento classificado automaticamente na ontologia.',
      className: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const containerClasses = cn(
    'space-y-6 pb-12 transition-colors duration-700 min-h-[calc(100vh-4rem)] p-4 sm:p-6',
    unitFilter === 'PRN Diagnósticos'
      ? 'bg-blue-50/40'
      : unitFilter === 'Medimagem'
        ? 'bg-purple-50/40'
        : 'bg-transparent',
  )

  return (
    <div className={containerClasses}>
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between border-b-2 border-[#004A99] pb-4">
          <img
            src="https://prndiagnosticos.com.br/wp-content/themes/prnd/assets/images/logo.png"
            alt="Logo"
            className="h-12 object-contain"
          />
          <div className="text-right">
            <h1 className="text-xl font-bold text-[#004A99]">
              PRN Control - Inteligência Operacional
            </h1>
            <p className="text-sm text-slate-500">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#004A99] flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-indigo-600" />
            The Brain Dashboard
          </h1>
          <p className="text-slate-500">
            Controle inteligente de ativos, pessoas e documentos legais.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <ToggleGroup
            type="single"
            value={unitFilter}
            onValueChange={(val) => val && setUnitFilter(val as any)}
            className="bg-white rounded-lg p-1 border shadow-sm"
          >
            <ToggleGroupItem value="All" className="text-sm">
              Global
            </ToggleGroupItem>
            <ToggleGroupItem
              value="PRN Diagnósticos"
              className="text-sm text-blue-700 data-[state=on]:bg-blue-100"
            >
              PRN
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Medimagem"
              className="text-sm text-purple-700 data-[state=on]:bg-purple-100"
            >
              Medimagem
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="bg-white border-slate-200 shadow-sm transition-transform hover:scale-105 duration-200"
          >
            <Printer className="mr-2 h-4 w-4" />{' '}
            <span className="hidden sm:inline">Relatório PDF</span>
          </Button>
        </div>
      </div>

      <UrgentActions items={items} />
      <WeeklyReport items={items} />
      <BICharts items={filteredItems} />
      <HealthCards items={filteredItems} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden mt-8">
        <h2 className="text-xl font-semibold text-[#004A99]">Tabela de Entidades (Workflow)</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button
            variant="outline"
            className="flex-1 sm:flex-none border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Extrair via IA
          </Button>
          <Button
            className="flex-1 sm:flex-none bg-[#004A99] hover:bg-[#003d7a] text-white shadow-md"
            onClick={handleOpenAdd}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Registro Manual
          </Button>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar entidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200 shadow-sm focus-visible:ring-[#004A99]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={cn(
              'bg-white text-slate-600',
              showPendingOnly && 'border-amber-500 text-amber-700 bg-amber-50',
            )}
          >
            <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Fila de Conferência
          </Button>

          <Select value={catFilter} onValueChange={(v) => setCatFilter(v as any)}>
            <SelectTrigger className="w-[180px] h-9 bg-white text-sm">
              <SelectValue placeholder="Categoria..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Todas Categorias</SelectItem>
              <SelectItem value="Technical Asset">Ativos Técnicos</SelectItem>
              <SelectItem value="Human Capital">Capital Humano</SelectItem>
              <SelectItem value="Legal Documentation">Documentos Legais</SelectItem>
            </SelectContent>
          </Select>

          {(showPendingOnly || catFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPendingOnly(false)
                setCatFilter('All')
              }}
              className="text-slate-500 hover:text-red-600"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <DataTable
        items={filteredItems}
        onInlineEdit={handleInlineEdit}
        onDelete={handleDelete}
        onViewDetails={setSelectedRecord}
      />

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveModal}
        initialData={null}
      />

      <RecordDetailSheet
        item={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onSave={handleUpdateRecord}
      />
    </div>
  )
}
