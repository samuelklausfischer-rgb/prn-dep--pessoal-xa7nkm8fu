import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { History, Save, Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import type { DashboardItem, InspectionRecord } from '@/types'

interface AssetDetailSheetProps {
  item: DashboardItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<DashboardItem>) => void
}

export function AssetDetailSheet({ item, isOpen, onClose, onSave }: AssetDetailSheetProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    lastInspectionDate: '',
    nextInspectionDate: '',
    responsibleCompany: '',
  })

  const [newLogDesc, setNewLogDesc] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        lastInspectionDate: item.lastInspectionDate || '',
        nextInspectionDate: item.nextInspectionDate || '',
        responsibleCompany: item.responsibleCompany || '',
      })
      setNewLogDesc('')
    }
  }, [item])

  if (!item) return null

  const handleSave = () => {
    onSave(item.id, {
      ...formData,
      lastEditedBy: 'Admin Sistema',
      lastEditedAt: new Date().toISOString(),
    })
    toast({
      title: 'Ficha Atualizada',
      description: 'Os detalhes do ativo foram salvos (Auditoria registrada).',
    })
    onClose()
  }

  const handleAddLog = () => {
    if (!newLogDesc.trim()) return
    const newRecord: InspectionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: newLogDesc,
      user: 'Admin Sistema',
    }

    const updatedHistory = [...(item.inspectionHistory || []), newRecord]
    onSave(item.id, {
      inspectionHistory: updatedHistory,
      lastEditedBy: 'Admin Sistema',
      lastEditedAt: new Date().toISOString(),
    })
    setNewLogDesc('')
    toast({ title: 'Histórico Atualizado', description: 'Nova vistoria registrada no log.' })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto print:hidden">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-[#004A99]">Ficha de Ativo</SheetTitle>
          <SheetDescription>
            Equipamento: <span className="font-semibold text-slate-800">{item.name}</span>
            <br />
            Código: {item.code || 'N/A'} | Unidade: {item.unit}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-700">Dados de Manutenção</h3>

            <div className="space-y-2">
              <Label htmlFor="lastInspection">Última Vistoria</Label>
              <Input
                id="lastInspection"
                type="date"
                value={formData.lastInspectionDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastInspectionDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextInspection">Próxima Vistoria</Label>
              <Input
                id="nextInspection"
                type="date"
                value={formData.nextInspectionDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nextInspectionDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleCompany">Empresa Responsável</Label>
              <Input
                id="responsibleCompany"
                placeholder="Ex: TechMed Manutenção"
                value={formData.responsibleCompany}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, responsibleCompany: e.target.value }))
                }
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-[#004A99] hover:bg-[#003d7a]">
              <Save className="h-4 w-4 mr-2" />
              Salvar Dados
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-700">Log de Vistorias</h3>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Descrição da nova vistoria..."
                value={newLogDesc}
                onChange={(e) => setNewLogDesc(e.target.value)}
              />
              <Button variant="secondary" onClick={handleAddLog}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              {!item.inspectionHistory || item.inspectionHistory.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhum registro histórico.</p>
              ) : (
                item.inspectionHistory.map((record) => (
                  <div key={record.id} className="text-sm border-l-2 border-[#004A99] pl-3 py-1">
                    <div className="font-medium">{format(new Date(record.date), 'dd/MM/yyyy')}</div>
                    <div className="text-slate-700">{record.description}</div>
                    <div className="text-xs text-slate-400 mt-1">Por: {record.user}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
