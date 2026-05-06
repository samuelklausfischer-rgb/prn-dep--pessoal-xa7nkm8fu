import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ValidationRecord } from '@/services/validations'
import { CheckCircle2, AlertTriangle, AlertCircle, ThumbsUp, Trash2, Settings2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ValidationReviewSheetProps {
  record: ValidationRecord | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, collection: string, updates: any) => void
}

export function ValidationReviewSheet({
  record,
  isOpen,
  onClose,
  onSave,
}: ValidationReviewSheetProps) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (record) {
      setFormData(record.raw)
    }
  }, [record])

  if (!record) return null

  const handleApprove = () => {
    onSave(record.id, record.collectionName, {
      ...formData,
      workflow_status: 'Validated by Finance',
      notes: null,
    })
    onClose()
  }

  const handleReject = () => {
    onSave(record.id, record.collectionName, {
      workflow_status: 'Completed/Archived',
    })
    onClose()
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const renderConfidenceAlert = () => {
    if (record.confidence === 'high') {
      return (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md flex items-start gap-3 border border-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Alta Confiança na Extração</p>
            <p className="text-xs mt-1 text-emerald-700">
              A inteligência artificial não identificou anomalias nos dados.
            </p>
          </div>
        </div>
      )
    }
    if (record.confidence === 'low') {
      return (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start gap-3 border border-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Atenção Necessária</p>
            <p className="text-xs mt-1 text-red-700">
              Campos obrigatórios podem estar ausentes ou com formato inválido. Por favor, revise
              manualmente.
            </p>
            {record.issues && record.issues.length > 0 && (
              <ul className="list-disc list-inside text-xs mt-2 text-red-700 ml-2">
                {record.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )
    }
    return (
      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-start gap-3 border border-yellow-100">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Confiança Moderada</p>
          <p className="text-xs mt-1 text-yellow-700">
            Recomendamos uma revisão rápida para garantir que os dados estejam corretos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#002D5F]" /> Revisão de Dados (IA)
          </SheetTitle>
          <SheetDescription>
            Origem: {record.type} | Unidade: {record.unitName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {renderConfidenceAlert()}

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Dados Extraídos</h3>

            {record.collectionName === 'personnel' && (
              <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargo/Função</Label>
                    <Input
                      value={formData.role || ''}
                      onChange={(e) => updateField('role', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Admissão</Label>
                    <Input
                      type="date"
                      value={
                        formData.admission_date ? formData.admission_date.substring(0, 10) : ''
                      }
                      onChange={(e) => updateField('admission_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {record.collectionName === 'assets' && (
              <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <Label>Nome do Ativo</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      value={formData.category || ''}
                      onChange={(e) => updateField('category', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Série</Label>
                    <Input
                      value={formData.serial_number || ''}
                      onChange={(e) => updateField('serial_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input
                      value={formData.brand || ''}
                      onChange={(e) => updateField('brand', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input
                      value={formData.model || ''}
                      onChange={(e) => updateField('model', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {record.collectionName === 'documents' && (
              <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <Label>Título do Documento</Label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input
                      value={formData.type || ''}
                      onChange={(e) => updateField('type', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custo Estimado (R$)</Label>
                    <Input
                      type="number"
                      value={formData.cost || 0}
                      onChange={(e) => updateField('cost', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Emissão</Label>
                    <Input
                      type="date"
                      value={formData.issue_date ? formData.issue_date.substring(0, 10) : ''}
                      onChange={(e) => updateField('issue_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Vencimento</Label>
                    <Input
                      type="date"
                      value={formData.due_date ? formData.due_date.substring(0, 10) : ''}
                      onChange={(e) => updateField('due_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="bg-blue-50/50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Comentários Adicionais</h4>
            <Input
              placeholder="Adicionar nota de validação..."
              className="bg-white border-blue-200"
              onBlur={(e) => {
                if (e.target.value) {
                  let currentNotes: any = {}
                  if (typeof formData.notes === 'string') {
                    try {
                      currentNotes = JSON.parse(formData.notes)
                    } catch {
                      /* ignore */
                    }
                  } else if (formData.notes) {
                    currentNotes = formData.notes
                  }
                  updateField(
                    'notes',
                    JSON.stringify({ ...currentNotes, auditor_note: e.target.value }),
                  )
                }
              }}
            />
          </div>
        </div>

        <SheetFooter className="mt-8 flex gap-3 sm:justify-between">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleReject}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Rejeitar Extração
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Salvar e Aprovar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
