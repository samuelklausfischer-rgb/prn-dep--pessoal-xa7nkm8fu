import { useEffect, useState, useMemo } from 'react'
import {
  CheckSquare,
  Filter,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getPendingValidations,
  ValidationRecord,
  updateValidationStatus,
} from '@/services/validations'
import { ValidationReviewSheet } from '@/components/dashboard/ValidationReviewSheet'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function Validations() {
  const [validations, setValidations] = useState<ValidationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterConfidence, setFilterConfidence] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState<ValidationRecord | null>(null)

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getPendingValidations()
      setValidations(data)
    } catch (e) {
      toast({ title: 'Erro ao buscar validações', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveValidation = async (id: string, collection: string, updates: any) => {
    try {
      await updateValidationStatus(collection, id, updates)
      toast({ title: 'Validação Concluída', description: 'O registro foi atualizado com sucesso.' })
      setValidations((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const filteredData = useMemo(() => {
    return validations.filter((v) => {
      const matchSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = filterType === 'all' || v.collectionName === filterType
      const matchConf = filterConfidence === 'all' || v.confidence === filterConfidence
      return matchSearch && matchType && matchConf
    })
  }, [validations, searchTerm, filterType, filterConfidence])

  const kpis = {
    total: validations.length,
    highConf: validations.filter((v) => v.confidence === 'high').length,
    errors: validations.filter((v) => v.confidence === 'low').length,
    doneToday: 0, // Mocked stat
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#002D5F] flex items-center gap-2">
          <CheckSquare className="h-8 w-8" /> Validar Extrações
        </h1>
        <p className="text-slate-500">
          Revise e aprove os dados processados pela Inteligência Artificial antes da inclusão no
          sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Pendente</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{kpis.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Alta Confiança</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">{kpis.highConf}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Atenção Necessária</p>
                <h3 className="text-3xl font-bold text-red-600 mt-1">{kpis.errors}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Concluídas Hoje</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{kpis.doneToday}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar registro..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="Tipo de Dado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="personnel">Colaboradores</SelectItem>
                <SelectItem value="assets">Ativos/Equipamentos</SelectItem>
                <SelectItem value="documents">Documentos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterConfidence} onValueChange={setFilterConfidence}>
              <SelectTrigger className="w-full sm:w-48 bg-white">
                <SelectValue placeholder="Confiança" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Confiança</SelectItem>
                <SelectItem value="high">Alta Confiança</SelectItem>
                <SelectItem value="medium">Média Confiança</SelectItem>
                <SelectItem value="low">Baixa Confiança / Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center text-slate-400">Carregando validações...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Operação em Dia</h3>
              <p className="text-slate-500 max-w-md">
                Não há novas extrações pendentes de validação neste momento. Os novos dados
                importados aparecerão aqui.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[100px] text-center">Status IA</TableHead>
                  <TableHead>Título / Identificação</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Extraído em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50 group">
                    <TableCell className="text-center">
                      {record.confidence === 'high' ? (
                        <div className="mx-auto bg-emerald-50 w-8 h-8 rounded-full flex items-center justify-center">
                          <CheckCircle2
                            className="h-5 w-5 text-emerald-500"
                            title="Alta Confiança"
                          />
                        </div>
                      ) : record.confidence === 'medium' ? (
                        <div className="mx-auto bg-yellow-50 w-8 h-8 rounded-full flex items-center justify-center">
                          <AlertCircle
                            className="h-5 w-5 text-yellow-500"
                            title="Média Confiança"
                          />
                        </div>
                      ) : (
                        <div className="mx-auto bg-red-50 w-8 h-8 rounded-full flex items-center justify-center animate-pulse">
                          <AlertTriangle
                            className="h-5 w-5 text-red-500"
                            title="Atenção/Erro de Extração"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-[#002D5F]">{record.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-slate-600 bg-white">
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{record.unitName}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(record.created), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        onClick={() => setSelectedRecord(record)}
                      >
                        Revisar & Aprovar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <ValidationReviewSheet
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onSave={handleSaveValidation}
      />
    </div>
  )
}
