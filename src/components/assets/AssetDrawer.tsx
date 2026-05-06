import { useState, useEffect } from 'react'
import { format } from 'date-fns'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createAsset, updateAsset } from '@/services/assets'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, MessageSquare, Plus, Save } from 'lucide-react'

const EQUIP_CATEGORIES = [
  'Equipamento Médico',
  'TI',
  'Mobiliário',
  'Máquina',
  'Outros Equipamentos',
]
const INFRA_CATEGORIES = [
  'Elétrica',
  'Hidráulica',
  'Predial',
  'Climatização',
  'Segurança',
  'Infraestrutura',
]

export function AssetDrawer({ isOpen, onClose, asset, onSaveComplete, units, mode }: any) {
  const isEquip = mode === 'equipment'
  const categories = isEquip ? EQUIP_CATEGORIES : INFRA_CATEGORIES

  const [formData, setFormData] = useState<any>({})
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setFormData(asset || { status: 'operational', weight: isEquip ? 2 : 1 })
      setNewNote('')
    }
  }, [isOpen, asset, isEquip])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.unit) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e a unidade.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const dataToSave = { ...formData }
      if (asset?.id) {
        await updateAsset(asset.id, dataToSave)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        await createAsset(dataToSave)
        toast({ title: 'Criado com sucesso' })
      }
      onSaveComplete()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !asset?.id) return
    const note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNote,
      user: user?.name || user?.email || 'Usuário',
      timestamp: new Date().toISOString(),
    }
    const updatedNotes = [...(formData.notes || []), note]
    handleChange('notes', updatedNotes)
    setNewNote('')

    try {
      await updateAsset(asset.id, { notes: updatedNotes })
      toast({ title: 'Nota adicionada ao histórico' })
      onSaveComplete()
    } catch (e) {
      toast({ title: 'Erro ao salvar nota', variant: 'destructive' })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 h-full border-l shadow-2xl">
        <SheetHeader className="px-6 py-4 border-b bg-slate-50/50">
          <SheetTitle className="text-xl font-bold text-[#002D5F]">
            {asset
              ? isEquip
                ? 'Editar Equipamento'
                : 'Editar Estrutura'
              : isEquip
                ? 'Novo Equipamento'
                : 'Nova Estrutura'}
          </SheetTitle>
          <SheetDescription>
            {asset
              ? 'Atualize os dados e adicione notas de auditoria.'
              : 'Preencha os dados do novo ativo.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>
                Nome / Identificação <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={isEquip ? 'Ex: Tomógrafo Philips' : 'Ex: Painel Elétrico Principal'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Unidade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit || ''}
                  onValueChange={(val) => handleChange('unit', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(val) => handleChange('category', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status Operacional</Label>
                <Select
                  value={formData.status || 'operational'}
                  onValueChange={(val) => handleChange('status', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional 🟢</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção 🟡</SelectItem>
                    <SelectItem value="offline">Inoperante / Crítico 🔴</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Progresso Admin.</Label>
                <Select
                  value={formData.workflow_status || 'Extracted (IA)'}
                  onValueChange={(val) => handleChange('workflow_status', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Extracted (IA)">Extraído (IA)</SelectItem>
                    <SelectItem value="Pending Conference">Pendente Conferência</SelectItem>
                    <SelectItem value="Validated by Finance">Validado Financeiro</SelectItem>
                    <SelectItem value="Completed/Archived">Concluído / Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEquip && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
                <h4 className="font-semibold text-sm text-slate-800">Detalhes Técnicos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Marca</Label>
                    <Input
                      value={formData.brand || ''}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Modelo</Label>
                    <Input
                      value={formData.model || ''}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nº Série</Label>
                    <Input
                      value={formData.serial_number || ''}
                      onChange={(e) => handleChange('serial_number', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Empresa Resp.</Label>
                    <Input
                      value={formData.responsible_company || ''}
                      onChange={(e) => handleChange('responsible_company', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isEquip && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
                <h4 className="font-semibold text-sm text-slate-800">Manutenção & Risco</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nível de Risco (1 a 3)</Label>
                    <Select
                      value={String(formData.weight || 1)}
                      onValueChange={(val) => handleChange('weight', Number(val))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Baixo / Regular (1)</SelectItem>
                        <SelectItem value="2">Médio / Atenção (2)</SelectItem>
                        <SelectItem value="3">Alto / Crítico (3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Empresa Resp. / Terceiro</Label>
                    <Input
                      value={formData.responsible_company || ''}
                      onChange={(e) => handleChange('responsible_company', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {asset && (
              <div className="pt-4 mt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  <h4 className="font-semibold text-sm text-slate-800">Histórico e Notas</h4>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Adicionar registro ao histórico..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="text-sm h-9"
                  />
                  <Button size="sm" onClick={handleAddNote} className="h-9 px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {!formData.notes || formData.notes.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed">
                      Nenhuma nota registrada.
                    </p>
                  ) : (
                    [...formData.notes].reverse().map((note: any) => (
                      <div
                        key={note.id}
                        className="text-sm bg-white p-3 rounded-lg border shadow-sm flex flex-col gap-1"
                      >
                        <div className="text-slate-800 leading-relaxed">{note.text}</div>
                        <div className="text-[10px] text-slate-500 font-medium flex justify-between">
                          <span>{note.user}</span>
                          <span>{format(new Date(note.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-slate-50/50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#002D5F] hover:bg-[#004A99]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
