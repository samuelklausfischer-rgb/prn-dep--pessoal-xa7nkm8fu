import { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Plus,
  Save,
  Search,
  Building2,
  Activity,
  FilterX,
  AlertCircle,
  Printer,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useToast } from '@/hooks/use-toast'
import { HealthCards } from '@/components/dashboard/HealthCards'
import { DataTable } from '@/components/dashboard/DataTable'
import { ItemDialog } from '@/components/dashboard/ItemDialog'
import { UrgentActions } from '@/components/dashboard/UrgentActions'
import { WeeklyReport } from '@/components/dashboard/WeeklyReport'
import { AssetDetailSheet } from '@/components/dashboard/AssetDetailSheet'
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
    validationStatus: 'Validated',
  },
  {
    id: '2',
    name: 'Manutenção Raio-X',
    unit: 'Medimagem',
    type: 'Equipamento',
    dueDate: getRelativeDate(15),
    code: 'MED-RX-01',
    financeStatus: 'Validated',
    validationStatus: 'Validated',
    lastEditedBy: 'Maria Financeiro',
    lastEditedAt: new Date(Date.now() - 86400000).toISOString(),
    lastInspectionDate: getRelativeDate(-180),
    nextInspectionDate: getRelativeDate(15),
    responsibleCompany: 'TechMed Serviços',
    inspectionHistory: [
      {
        id: 'h1',
        date: getRelativeDate(-180),
        description: 'Troca de tubo',
        user: 'Admin Sistema',
      },
    ],
  },
  {
    id: '3',
    name: 'Maria Oliveira - Treinamento',
    unit: 'PRN Diagnósticos',
    type: 'Colaborador',
    dueDate: getRelativeDate(45),
    sector: 'Enfermagem',
    financeStatus: 'Pending',
    validationStatus: 'Pending',
  },
  {
    id: '4',
    name: 'Calibração Tomógrafo',
    unit: 'PRN Diagnósticos',
    type: 'Equipamento',
    dueDate: getRelativeDate(-2),
    code: 'PRN-TM-01',
    financeStatus: 'Pending',
    validationStatus: 'Validated',
  },
  {
    id: '5',
    name: 'Vistoria Semestral RM',
    unit: 'PRN Diagnósticos',
    type: 'Vistoria',
    dueDate: getRelativeDate(5),
    code: 'PRN-RM-02',
    financeStatus: 'Pending',
    validationStatus: 'Validated',
  },
]

const CURRENT_USER = 'Admin Sistema'

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<DashboardItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [unitFilter, setUnitFilter] = useState<'All' | 'PRN Diagnósticos' | 'Medimagem'>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Vistoria'>('All')
  const [showPendingValidation, setShowPendingValidation] = useState(false)

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenAdd = () => setIsDialogOpen(true)

  const handleSaveModal = (itemData: Partial<DashboardItem>) => {
    const newItem: DashboardItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      financeStatus: 'Pending',
      validationStatus: 'Validated',
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
    if (field === 'validationStatus' && value === 'Validated') {
      toast({ title: 'Registro Validado', description: 'Auditoria atualizada.' })
    }
  }

  const handleUpdateAsset = (id: string, updates: Partial<DashboardItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setSelectedAsset((prev) =>
      prev && prev.id === id ? ({ ...prev, ...updates } as DashboardItem) : prev,
    )
  }

  // Filter items based on criteria
  const filteredItems = items.filter((item) => {
    if (unitFilter !== 'All' && item.unit !== unitFilter) return false

    if (showPendingValidation && item.validationStatus !== 'Pending') return false

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

    // Mock parsing for demonstration
    const mockImport: DashboardItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Registro Importado - ${file.name.substring(0, 10)}`,
      unit: unitFilter !== 'All' ? unitFilter : 'PRN Diagnósticos',
      type: 'Colaborador',
      dueDate: getRelativeDate(20),
      sector: 'Extração',
      financeStatus: 'Pending',
      validationStatus: 'Pending', // Force pending for extracted items
      lastEditedBy: CURRENT_USER,
      lastEditedAt: new Date().toISOString(),
    }
    setItems((prev) => [...prev, mockImport])
    toast({
      title: 'Planilha Importada',
      description: 'Dados extraídos com status "Pendente de Validação".',
      className: 'bg-amber-50 border-amber-200',
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const containerClasses = cn(
    'space-y-6 pb-12 transition-colors duration-700 min-h-[calc(100vh-4rem)] p-4 sm:p-6',
    unitFilter === 'PRN Diagnósticos'
      ? 'bg-blue-50/40 rounded-xl'
      : unitFilter === 'Medimagem'
        ? 'bg-purple-50/40 rounded-xl'
        : 'bg-transparent',
  )

  return (
    <div className={containerClasses}>
      {/* Print-only Header */}
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between border-b-2 border-[#004A99] pb-4">
          <img
            src="https://prndiagnosticos.com.br/wp-content/themes/prnd/assets/images/logo.png"
            alt="PRN Logo"
            className="h-12 object-contain"
          />
          <div className="text-right">
            <h1 className="text-xl font-bold text-[#004A99]">Relatório de Ativos e Vencimentos</h1>
            <p className="text-sm text-slate-500">
              Unidade: {unitFilter} | Data: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#004A99]">Visão Geral</h1>
          <p className="text-slate-500">Acompanhamento de vencimentos e ativos.</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <ToggleGroup
            type="single"
            value={unitFilter}
            onValueChange={(val) => val && setUnitFilter(val as any)}
            className="bg-white rounded-lg p-1 border shadow-sm"
          >
            <ToggleGroupItem value="All" className="text-sm">
              Ver Tudo
            </ToggleGroupItem>
            <ToggleGroupItem
              value="PRN Diagnósticos"
              className="text-sm text-blue-700 data-[state=on]:bg-blue-100"
            >
              Unidade PRN
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Medimagem"
              className="text-sm text-purple-700 data-[state=on]:bg-purple-100"
            >
              Unidade Medimagem
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            onClick={handlePrintPDF}
            variant="outline"
            className="bg-white border-slate-200 shadow-sm transition-transform hover:scale-105 duration-200"
          >
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
        </div>
      </div>

      <div className="print:hidden">
        <UrgentActions items={items} />
      </div>

      <div className="print:hidden">
        <WeeklyReport items={items} />
      </div>

      <HealthCards items={filteredItems} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden mt-8">
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

      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome, equipamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-200 shadow-sm focus-visible:ring-[#004A99]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPendingValidation(!showPendingValidation)}
            className={cn(
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              showPendingValidation && 'border-amber-500 text-amber-700 bg-amber-50',
            )}
          >
            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
            Pendentes de Validação
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeFilter(typeFilter === 'Vistoria' ? 'All' : 'Vistoria')}
            className={cn(
              'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              typeFilter === 'Vistoria' && 'border-indigo-500 text-indigo-700 bg-indigo-50',
            )}
          >
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Vistorias
          </Button>

          {(showPendingValidation || typeFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPendingValidation(false)
                setTypeFilter('All')
              }}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
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
        onViewDetails={setSelectedAsset}
      />

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveModal}
        initialData={null}
      />

      <AssetDetailSheet
        item={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSave={handleUpdateAsset}
      />
    </div>
  )
}
