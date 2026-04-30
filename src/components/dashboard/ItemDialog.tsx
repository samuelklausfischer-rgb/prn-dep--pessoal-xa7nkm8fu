import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { DashboardItem } from '@/types'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  unit: z.enum(['PRN Diagnósticos', 'Medimagem'], { required_error: 'Selecione uma unidade' }),
  type: z.enum(['Colaborador', 'Equipamento', 'Vistoria'], { required_error: 'Selecione um tipo' }),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  code: z.string().optional(),
  sector: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Partial<DashboardItem>) => void
  initialData: DashboardItem | null
}

export function ItemDialog({ isOpen, onClose, onSave, initialData }: ItemDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      unit: 'PRN Diagnósticos',
      type: 'Colaborador',
      dueDate: '',
      code: '',
      sector: '',
    },
  })

  const watchType = form.watch('type')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          unit: initialData.unit,
          type: initialData.type,
          dueDate: initialData.dueDate,
          code: initialData.code || '',
          sector: initialData.sector || '',
        })
      } else {
        form.reset({
          name: '',
          unit: 'PRN Diagnósticos',
          type: 'Colaborador',
          dueDate: '',
          code: '',
          sector: '',
        })
      }
    }
  }, [isOpen, initialData, form])

  const onSubmit = (values: FormValues) => {
    // Clean up conditional fields based on selection type
    if (values.type === 'Colaborador') values.code = undefined
    if (values.type === 'Equipamento') values.sector = undefined
    onSave(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-white/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? 'Editar Registro' : 'Novo Registro'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Registro</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Colaborador" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Colaborador</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Equipamento" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Equipamento</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Vistoria" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Vistoria</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchType === 'Equipamento'
                      ? 'Nome do Equipamento'
                      : watchType === 'Vistoria'
                        ? 'Descrição da Vistoria'
                        : 'Nome do Colaborador'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva / Tomógrafo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRN Diagnósticos">PRN Diagnósticos</SelectItem>
                        <SelectItem value="Medimagem">Medimagem</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === 'Equipamento' || watchType === 'Vistoria' ? (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="animate-fade-in">
                    <FormLabel>Código / Patrimônio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PRN-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem className="animate-fade-in">
                    <FormLabel>Setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recepção, Limpeza..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#004A99] hover:bg-[#003d7a] text-white">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
