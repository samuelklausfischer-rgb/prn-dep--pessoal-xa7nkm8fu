import { useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ImportData() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [successBanner, setSuccessBanner] = useState<{ visible: boolean; count: number }>({
    visible: false,
    count: 0,
  })

  const handleSimulateImport = () => {
    setIsProcessing(true)
    setSuccessBanner({ visible: false, count: 0 })

    // Simulate API delay
    setTimeout(() => {
      setIsProcessing(false)
      const mockCount = Math.floor(Math.random() * 50) + 15 // Random count between 15-64
      setSuccessBanner({ visible: true, count: mockCount })
    }, 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {successBanner.visible && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 animate-fade-in-down shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-800 font-medium">
            {successBanner.count} novos registros identificados e organizados nas pastas corretas.
          </p>
        </div>
      )}

      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 text-[#002D5F] mb-2">
          <Upload className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Importar Dados</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Área de upload para planilhas e extrações do SharePoint.
        </p>

        <Card
          className="border-dashed border-2 bg-slate-50 hover:bg-slate-100 transition-colors border-slate-300 p-12 flex flex-col items-center justify-center text-center cursor-pointer"
          onClick={handleSimulateImport}
        >
          <FileSpreadsheet className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Arraste e solte planilhas aqui
          </h3>
          <p className="text-sm text-slate-500 mb-6">Suporta arquivos .xlsx, .csv</p>
          <Button className="bg-[#002D5F] hover:bg-[#004A99] text-white" disabled={isProcessing}>
            {isProcessing ? 'Processando dados da IA...' : 'Selecionar Arquivo Excel'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
