import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { Plus, MessageSquare, Printer, ShieldAlert } from 'lucide-react'
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
import { useAuth } from '@/contexts/auth-context'
import type { DashboardItem, Note, TechnicalAsset, HumanCapital, LegalDocumentation } from '@/types'

interface RecordDetailSheetProps {
  item: DashboardItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<DashboardItem>) => void
}

export function RecordDetailSheet({ item, isOpen, onClose, onSave }: RecordDetailSheetProps) {
  const { toast } = useToast()
  const { role } = useAuth()
  const [newNote, setNewNote] = useState('')
  const [financeNote, setFinanceNote] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  if (!item) return null

  const isFinance = role === 'Financeiro'
  const isFinanceLocked =
    isFinance && (item.category === 'Human Capital' || item.category === 'Legal Documentation')

  const handlePrint = () => {
    window.print()
  }

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
                disabled={isFinanceLocked}
                onBlur={(e) => onSave(item.id, { role: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                Admissão{' '}
                {isFinanceLocked && (
                  <ShieldAlert className="h-3 w-3 text-red-500" title="Apenas Admin pode editar" />
                )}
              </Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.admissionDate}
                disabled={isFinanceLocked}
                onBlur={(e) => onSave(item.id, { admissionDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                Fim Exp. 45d {isFinanceLocked && <ShieldAlert className="h-3 w-3 text-red-500" />}
              </Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.probation45Date}
                disabled={isFinanceLocked}
                onBlur={(e) => onSave(item.id, { probation45Date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                Fim Exp. 90d {isFinanceLocked && <ShieldAlert className="h-3 w-3 text-red-500" />}
              </Label>
              <Input
                className="h-8 text-sm"
                type="date"
                defaultValue={hc.probation90Date}
                disabled={isFinanceLocked}
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
      <SheetContent className="w-full sm:max-w-md overflow-y-auto print:w-full print:max-w-none print:p-0">
        <div ref={printRef} className="print-area">
          <SheetHeader className="mb-6 print:mb-2 print:border-b print:pb-4">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-bold text-[#004A99] print:text-2xl print:text-black">
                  <span className="print:hidden">Ficha & Auditoria</span>
                  <span className="hidden print:inline">Comprovante de Registro</span>
                </SheetTitle>
                <SheetDescription className="font-medium text-slate-800 print:text-black print:text-base mt-2">
                  <span className="font-bold text-lg">{item.name}</span> <br />
                  <span className="text-sm text-slate-500 font-normal print:text-slate-700">
                    ID: {item.id} | Unidade: {item.unit} | Categoria: {item.category}{' '}
                    <br className="hidden print:block" />
                    Status: {item.status} | Vencimento:{' '}
                    {item.dueDate ? format(new Date(item.dueDate), 'dd/MM/yyyy') : 'N/A'}
                  </span>
                </SheetDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="print:hidden text-[#002D5F] hover:text-[#004A99]"
              >
                <Printer className="h-4 w-4 mr-2" />
                Gerar Comprovante
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 print:space-y-4">
            <div className="space-y-2 print:border print:p-4 print:rounded-md">
              <Label className="print:font-bold">Custo Estimado (R$)</Label>
              <Input
                type="number"
                defaultValue={item.cost || 0}
                className="print:border-none print:shadow-none print:p-0 print:h-auto print:font-medium"
                disabled={isFinanceLocked}
                onBlur={(e) => onSave(item.id, { cost: Number(e.target.value) })}
              />
            </div>

            {renderSpecificFields()}

            {isFinanceLocked && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 print:hidden mt-4">
                <Label className="text-xs font-semibold text-red-900 flex items-center gap-1 mb-2">
                  <ShieldAlert className="h-4 w-4" /> Sugerir Correção (Visão Financeiro)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Data de admissão incorreta..."
                    className="bg-white text-sm h-8 border-red-200 focus-visible:ring-red-500"
                    value={financeNote}
                    onChange={(e) => setFinanceNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && financeNote.trim()) {
                        const note: Note = {
                          id: Math.random().toString(36).substr(2, 9),
                          text: `[CORREÇÃO SUGERIDA]: ${financeNote}`,
                          user: 'Financeiro',
                          timestamp: new Date().toISOString(),
                        }
                        onSave(item.id, { notes: [...(item.notes || []), note] })
                        setFinanceNote('')
                        toast({ title: 'Sugestão Enviada' })
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 bg-red-100 text-red-900 hover:bg-red-200"
                    onClick={() => {
                      if (financeNote.trim()) {
                        const note: Note = {
                          id: Math.random().toString(36).substr(2, 9),
                          text: `[CORREÇÃO SUGERIDA]: ${financeNote}`,
                          user: 'Financeiro',
                          timestamp: new Date().toISOString(),
                        }
                        onSave(item.id, { notes: [...(item.notes || []), note] })
                        setFinanceNote('')
                        toast({ title: 'Sugestão Enviada' })
                      }
                    }}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            )}

            <Separator className="print:hidden mt-6" />

            <div className="space-y-4 print:hidden">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
