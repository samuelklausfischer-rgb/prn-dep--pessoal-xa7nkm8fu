import { useEffect, useState, useMemo } from 'react'
import { FileText, Search, AlertTriangle, ShieldCheck, Clock, FileWarning, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { getAllDocuments, type Document } from '@/services/documents'
import { useRealtime } from '@/hooks/use-realtime'
import { format, isPast, isToday, differenceInDays } from 'date-fns'

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const loadData = async () => {
    try {
      const data = await getAllDocuments()
      const legalDocs = data.filter((d) => !['Exame', 'Treinamento'].includes(d.type || ''))
      setDocuments(legalDocs)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('documents', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.expand?.unit?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || d.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [documents, searchTerm, typeFilter])

  const total = documents.length

  const expiredDocs = documents.filter(
    (d) => d.due_date && isPast(new Date(d.due_date)) && !isToday(new Date(d.due_date)),
  ).length

  const expiringSoonDocs = documents.filter((d) => {
    if (!d.due_date) return false
    const dt = new Date(d.due_date)
    if (isPast(dt) && !isToday(dt)) return false
    const days = differenceInDays(dt, new Date())
    return days <= 30
  }).length

  const getDocStatus = (dueDate?: string) => {
    if (!dueDate) return { label: 'Indefinido', color: 'bg-slate-100 text-slate-700', icon: null }
    const dt = new Date(dueDate)
    if (isPast(dt) && !isToday(dt))
      return {
        label: 'Vencido',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <FileWarning className="w-3 h-3 mr-1" />,
      }
    const days = differenceInDays(dt, new Date())
    if (days <= 30)
      return {
        label: `Vence em ${days}d`,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <AlertTriangle className="w-3 h-3 mr-1" />,
      }
    return {
      label: 'Válido',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <ShieldCheck className="w-3 h-3 mr-1" />,
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-[#002D5F]">
          <FileText className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Alvarás e Documentos</h1>
            <p className="text-slate-500 text-sm">
              Gestão da documentação legal e clínica obrigatória.
            </p>
          </div>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700">+ Novo Documento</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vencidos</CardTitle>
            <FileWarning className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Vencendo em 30 dias
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{expiringSoonDocs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar documento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Alvará">Alvará</SelectItem>
                <SelectItem value="Licença">Licença</SelectItem>
                <SelectItem value="Certificado">Certificado</SelectItem>
                <SelectItem value="Contrato">Contrato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Documento</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                      <FileText className="h-12 w-12 text-slate-300" />
                      <p>Nenhum documento encontrado.</p>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        Adicionar o primeiro documento
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => {
                  const status = getDocStatus(doc.due_date)
                  const isExpired =
                    doc.due_date &&
                    isPast(new Date(doc.due_date)) &&
                    !isToday(new Date(doc.due_date))
                  return (
                    <TableRow key={doc.id}>
                      <TableCell
                        className={`font-medium ${isExpired ? 'text-red-700' : 'text-slate-900'}`}
                      >
                        {doc.title}
                      </TableCell>
                      <TableCell>{doc.expand?.unit?.name || '-'}</TableCell>
                      <TableCell>{doc.type || '-'}</TableCell>
                      <TableCell>
                        {doc.issue_date ? format(new Date(doc.issue_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className={isExpired ? 'text-red-600 font-semibold' : ''}>
                        {doc.due_date ? format(new Date(doc.due_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border flex items-center w-fit ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDoc(doc)}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle className="text-2xl">{selectedDoc?.title}</DrawerTitle>
              <DrawerDescription>Metadados e detalhes do documento</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status de Validade</p>
                  <div className="mt-1">
                    {selectedDoc &&
                      (() => {
                        const s = getDocStatus(selectedDoc.due_date)
                        return (
                          <Badge variant="outline" className={`border ${s.color}`}>
                            {s.icon}
                            {s.label}
                          </Badge>
                        )
                      })()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Urgência</p>
                  <p className="text-sm capitalize">{selectedDoc?.urgency || 'Normal'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Unidade</p>
                  <p className="text-sm">{selectedDoc?.expand?.unit?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tipo</p>
                  <p className="text-sm">{selectedDoc?.type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Data de Emissão</p>
                  <p className="text-sm">
                    {selectedDoc?.issue_date
                      ? format(new Date(selectedDoc.issue_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Data de Vencimento</p>
                  <p
                    className={`text-sm ${selectedDoc?.due_date && isPast(new Date(selectedDoc.due_date)) && !isToday(new Date(selectedDoc.due_date)) ? 'text-red-600 font-semibold' : ''}`}
                  >
                    {selectedDoc?.due_date
                      ? format(new Date(selectedDoc.due_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
              </div>
              {selectedDoc?.notes && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Observações</p>
                  <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                    {typeof selectedDoc.notes === 'string'
                      ? selectedDoc.notes
                      : JSON.stringify(selectedDoc.notes)}
                  </div>
                </div>
              )}
            </div>
            <DrawerFooter>
              <Button className="w-full bg-sky-600 hover:bg-sky-700">Atualizar Documento</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
