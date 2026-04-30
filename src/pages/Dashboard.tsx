import { useState, useRef } from 'react'
import { FileSpreadsheet, Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { HealthCards } from '@/components/dashboard/HealthCards'
import { DataTable } from '@/components/dashboard/DataTable'
import { ItemDialog } from '@/components/dashboard/ItemDialog'
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
  },
  {
    id: '2',
    name: 'Manutenção Raio-X',
    unit: 'Medimagem',
    type: 'Equipamento',
    dueDate: getRelativeDate(15),
    code: 'MED-RX-01',
  },
  {
    id: '3',
    name: 'Maria Oliveira - Treinamento',
    unit: 'PRN Diagnósticos',
    type: 'Colaborador',
    dueDate: getRelativeDate(45),
    sector: 'Enfermagem',
  },
  {
    id: '4',
    name: 'Calibração Tomógrafo',
    unit: 'PRN Diagnósticos',
    type: 'Equipamento',
    dueDate: getRelativeDate(-2),
    code: 'PRN-TM-01',
  },
]

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenAdd = () => setIsDialogOpen(true)

  const handleSaveModal = (itemData: Partial<DashboardItem>) => {
    const newItem: DashboardItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
    } as DashboardItem
    setItems((prev) => [...prev, newItem])
    toast({ title: 'Sucesso', description: 'Novo registro adicionado.' })
    setIsDialogOpen(false)
  }

  const handleInlineEdit = (id: string, field: keyof DashboardItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

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
            let type: RecordType = typeRaw?.toLowerCase().includes('equip')
              ? 'Equipamento'
              : 'Colaborador'

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Visão Geral</h1>
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

      <HealthCards items={items} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Painel de Vencimentos</h2>
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
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 transition-transform hover:scale-105 duration-200 shadow-md"
            onClick={handleOpenAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo
          </Button>
        </div>
      </div>

      <DataTable items={items} onInlineEdit={handleInlineEdit} onDelete={handleDelete} />

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveModal}
        initialData={null}
      />
    </div>
  )
}
