import { useState } from 'react'
import { FileSpreadsheet, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { HealthCards } from '@/components/dashboard/HealthCards'
import { DataTable } from '@/components/dashboard/DataTable'
import { ItemDialog } from '@/components/dashboard/ItemDialog'
import type { DashboardItem } from '@/types'

// Mock Data to generate some dates relative to today
const getRelativeDate = (daysToAdd: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysToAdd)
  return d.toISOString().split('T')[0]
}

const INITIAL_ITEMS: DashboardItem[] = [
  {
    id: '1',
    name: 'Licença Sanitária',
    unit: 'PRN',
    category: 'Documento',
    dueDate: getRelativeDate(3),
  },
  {
    id: '2',
    name: 'Manutenção Raio-X',
    unit: 'Medimagem',
    category: 'Equipamento',
    dueDate: getRelativeDate(15),
  },
  {
    id: '3',
    name: 'Exame Periódico - João',
    unit: 'PRN',
    category: 'RH',
    dueDate: getRelativeDate(45),
  },
  {
    id: '4',
    name: 'Contrato de Limpeza',
    unit: 'PRN',
    category: 'Contrato',
    dueDate: getRelativeDate(-2),
  },
  {
    id: '5',
    name: 'Calibração Tomógrafo',
    unit: 'Medimagem',
    category: 'Equipamento',
    dueDate: getRelativeDate(8),
  },
]

export default function Dashboard() {
  const [items, setItems] = useState<DashboardItem[]>(INITIAL_ITEMS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null)
  const { toast } = useToast()

  const handleOpenAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (item: DashboardItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (itemData: Partial<DashboardItem>) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? ({ ...i, ...itemData } as DashboardItem) : i)),
      )
      toast({ title: 'Sucesso', description: 'Registro atualizado com sucesso.' })
    } else {
      const newItem: DashboardItem = {
        ...itemData,
        id: Math.random().toString(36).substr(2, 9),
      } as DashboardItem
      setItems((prev) => [...prev, newItem])
      toast({ title: 'Sucesso', description: 'Novo registro adicionado.' })
    }
    setIsDialogOpen(false)
  }

  const handleSimulateImport = () => {
    const mockImport: DashboardItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Treinamento Brigada (Planilha)',
      unit: 'PRN',
      category: 'RH',
      dueDate: getRelativeDate(20),
    }
    setItems((prev) => [...prev, mockImport])
    toast({
      title: 'Planilha Importada',
      description: 'Os dados foram extraídos e adicionados à tabela.',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Visão Geral</h1>
        <p className="text-slate-500">Acompanhamento de vencimentos e ativos.</p>
      </div>

      <HealthCards items={items} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Painel de Vencimentos</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none glass-panel border-blue-200 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 duration-200"
            onClick={handleSimulateImport}
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

      <DataTable items={items} onEdit={handleOpenEdit} />

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
