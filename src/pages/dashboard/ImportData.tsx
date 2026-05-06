import { useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, Play, CheckCircle, File, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const INITIAL_UPLOADS = [
  {
    id: '1',
    name: 'Planilha_Colaboradores.xlsx',
    status: 'Aguardando Validação',
    date: 'Hoje, 09:30',
    type: 'Colaboradores',
  },
  {
    id: '2',
    name: 'Relatorio_Equipamentos.pdf',
    status: 'Extraído com Sucesso',
    date: 'Ontem, 14:15',
    type: 'Ativos',
  },
  {
    id: '3',
    name: 'Alvaras_Vencidos.pdf',
    status: 'Erro de Leitura',
    date: '02/05/2026, 11:00',
    type: 'Documentos',
  },
]

export default function ImportData() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [uploads, setUploads] = useState(INITIAL_UPLOADS)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<{ name: string; progress: number } | null>(
    null,
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const processFile = (file: File) => {
    setUploadingFile({ name: file.name, progress: 0 })

    let prog = 0
    const interval = setInterval(() => {
      prog += 20
      if (prog >= 100) {
        clearInterval(interval)
        setUploadingFile(null)
        toast({
          title: 'Arquivo recebido',
          description: 'O documento foi processado pela IA e está pronto para validação.',
        })
        setUploads((prev) => [
          {
            id: Math.random().toString(),
            name: file.name,
            status: 'Aguardando Validação',
            date: 'Agora',
            type: 'Misto',
          },
          ...prev,
        ])
      } else {
        setUploadingFile({ name: file.name, progress: prog })
      }
    }, 400)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando Validação':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Aguardando Validação
          </Badge>
        )
      case 'Processando':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            Processando...
          </Badge>
        )
      case 'Extraído com Sucesso':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
            Sucesso
          </Badge>
        )
      case 'Erro de Leitura':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Erro</Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#002D5F] flex items-center gap-2">
          <Upload className="h-8 w-8" /> Central de Importação Integrada
        </h1>
        <p className="text-slate-500">
          Faça o upload de planilhas ou documentos para extração inteligente de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card
            className={cn(
              'border-dashed border-2 transition-all duration-200 relative overflow-hidden',
              isDragging
                ? 'border-sky-500 bg-sky-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-12 flex flex-col items-center justify-center text-center h-64">
              {uploadingFile ? (
                <div className="w-full max-w-xs space-y-4 animate-fade-in-up">
                  <div className="flex items-center justify-between text-sm text-[#004A99] font-medium">
                    <span className="truncate pr-4 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 shrink-0" />
                      {uploadingFile.name}
                    </span>
                    <span>{Math.min(uploadingFile.progress, 100)}%</span>
                  </div>
                  <Progress value={uploadingFile.progress} className="h-2 bg-blue-100" />
                  <p className="text-xs text-slate-500">IA extraindo entidades e metadados...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-[#004A99] mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    Arraste e solte seus arquivos aqui
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Suporta arquivos PDF, XLSX, CSV (Max 50MB)
                  </p>

                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInput}
                      accept=".pdf,.xlsx,.csv"
                    />
                    <Button className="bg-[#002D5F] hover:bg-[#004A99] text-white">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-slate-500" /> Histórico e Uploads Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="pl-4">Arquivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-4">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-700 flex items-center gap-2 pl-4">
                        <File className="h-4 w-4 text-slate-400" />
                        {item.name}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{item.date}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{item.type}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right pr-4">
                        {(item.status === 'Aguardando Validação' ||
                          item.status === 'Extraído com Sucesso') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#004A99] hover:text-[#002D5F] hover:bg-blue-50"
                            onClick={() => navigate('/dashboard/validations')}
                          >
                            Validar Extração
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#002D5F] text-white border-none shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <CheckCircle2 className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-sky-300" /> Guia Rápido
              </CardTitle>
              <CardDescription className="text-slate-300">
                Como funciona o fluxo de importação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200 relative z-10">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <p>
                  <strong className="text-white block mb-0.5">Enviar Arquivo</strong> Faça o upload
                  do documento original ou planilha padrão.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <p>
                  <strong className="text-white block mb-0.5">Aguardar Leitura</strong> A IA vai
                  extrair as entidades e classificá-las rapidamente.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <p>
                  <strong className="text-white block mb-0.5">Revisar Extração</strong> Identifique
                  possíveis anomalias apontadas pela IA.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-bold text-xs">
                  4
                </div>
                <p>
                  <strong className="text-white block mb-0.5">Validar</strong> Aprove os registros
                  para incluí-los na base oficial de ativos e RH.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" /> Suporte Avançado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-700">
              O sistema utiliza reconhecimento ótico de caracteres. Fotos de alvarás, vistorias
              escaneadas e atestados médicos também são interpretados e mapeados automaticamente.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
