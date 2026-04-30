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
import type { DashboardItem } from '@/types'

const formSchema = z.object({
  name: z.string().min(2, 'Obrigatório'),
  unit: z.enum(['PRN Diagnósticos', 'Medimagem']),
  category: z.enum(['Technical Asset', 'Human Capital', 'Legal Documentation']),
  dueDate: z.string().min(1, 'Obrigatório'),
  cost: z.coerce.number().optional(),
  docType: z.string().optional(),
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
      category: 'Legal Documentation',
      dueDate: '',
      cost: 0,
    },
  })

  const watchCat = form.watch('category')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          unit: initialData.unit,
          category: initialData.category,
          dueDate: initialData.dueDate,
          cost: initialData.cost || 0,
        })
      } else {
        form.reset({
          name: '',
          unit: 'PRN Diagnósticos',
          category: 'Legal Documentation',
          dueDate: '',
          cost: 0,
        })
      }
    }
  }, [isOpen, initialData, form])

  const onSubmit = (values: FormValues) => {
    onSave(values as Partial<DashboardItem>)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#004A99]">
            {initialData ? 'Editar' : 'Novo Registro IA'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria da Entidade (Ontologia)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Legal Documentation">Documento Legal</SelectItem>
                      <SelectItem value="Technical Asset">Ativo Técnico</SelectItem>
                      <SelectItem value="Human Capital">Capital Humano</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome / Identificador</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRN Diagnósticos">PRN</SelectItem>
                        <SelectItem value="Medimagem">Medimagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento / Prazo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {watchCat === 'Legal Documentation' && (
              <FormField
                control={form.control}
                name="docType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alvará">Alvará</SelectItem>
                        <SelectItem value="Sanitary License">Licença Sanitária</SelectItem>
                        <SelectItem value="CNES">CNES</SelectItem>
                        <SelectItem value="Rent Contract">Contrato de Aluguel</SelectItem>
                        <SelectItem value="Internal Document">Documento Interno</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo Estimado (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#004A99] hover:bg-[#003d7a]">
                Inserir no Brain
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
