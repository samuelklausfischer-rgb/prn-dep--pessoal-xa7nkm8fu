import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, MessageSquare } from 'lucide-react'
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
import type { DashboardItem, Note, TechnicalAsset, HumanCapital, LegalDocumentation } from '@/types'

interface RecordDetailSheetProps {
  item: DashboardItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<DashboardItem>) => void
}

export function RecordDetailSheet({ item, isOpen, onClose, onSave }: RecordDetailSheetProps) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState('')

  if (!item) return null

  const handleAddNote = () => {
    if (!newNote.trim()) return
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNote,
      user: 'Gestor (Ativo)',
      timestamp: new Date().toISOString(),
    }
    onSave(item.id, { notes: [...(item.notes || []), note] })
    setNewNote('')
    toast({ title: 'Nota Adicionada', description: 'Registro de auditoria atualizado.' })
  }

  const renderSpecificFields = () => {
    if (item.category === 'Technical Asset') {
      const asset = item as TechnicalAsset
      return (
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 text-sm">Metadados: Ativo Técnico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Marca</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={asset.brand}
                onBlur={(e) => onSave(item.id, { brand: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Modelo</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={asset.model}
                onBlur={(e) => onSave(item.id, { model: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nº Série</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={asset.serialNumber}
                onBlur={(e) => onSave(item.id, { serialNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Empresa Resp.</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={asset.responsibleCompany}
                onBlur={(e) => onSave(item.id, { responsibleCompany: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }
    if (item.category === 'Human Capital') {
      const hc = item as HumanCapital
      return (
        <div className="space-y-4 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
          <h3 className="font-semibold text-emerald-900 text-sm">Metadados: Capital Humano</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Cargo</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={hc.role}
                onBlur={(e) => onSave(item.id, { role: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Admissão</Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.admissionDate}
                onBlur={(e) => onSave(item.id, { admissionDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim Exp. 45d</Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.probation45Date}
                onBlur={(e) => onSave(item.id, { probation45Date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim Exp. 90d</Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.probation90Date}
                onBlur={(e) => onSave(item.id, { probation90Date: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }
    if (item.category === 'Legal Documentation') {
      const doc = item as LegalDocumentation
      return (
        <div className="space-y-4 bg-purple-50/50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-900 text-sm">Metadados: Documento Legal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Tipo Documento</Label>
              <Input
                className="h-8 text-sm"
                defaultValue={doc.docType}
                onBlur={(e) => onSave(item.id, { docType: e.target.value as any })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data Emissão</Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={doc.issueDate}
                onBlur={(e) => onSave(item.id, { issueDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-[#004A99]">Ficha & Auditoria</SheetTitle>
          <SheetDescription className="font-medium text-slate-800">
            {item.name} <br />
            <span className="text-xs text-slate-500 font-normal">
              Unidade: {item.unit} | Categoria: {item.category}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Custo Estimado (R$)</Label>
            <Input
              type="number"
              defaultValue={item.cost || 0}
              onBlur={(e) => onSave(item.id, { cost: Number(e.target.value) })}
            />
          </div>

          {renderSpecificFields()}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-700">Comunicação Interna</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Financeiro aprovou renovação..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button variant="secondary" onClick={handleAddNote}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 mt-4">
              {!item.notes || item.notes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhuma anotação registrada.</p>
              ) : (
                item.notes.map((note) => (
                  <div
                    key={note.id}
                    className="text-sm border-l-2 border-[#004A99] pl-3 py-1.5 bg-slate-50 rounded-r-md"
                  >
                    <div className="text-slate-700">{note.text}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                      {note.user} • {format(new Date(note.timestamp), 'dd/MM/yyyy HH:mm')}
                    </div>
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
