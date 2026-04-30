import { Upload } from 'lucide-react'

export default function ImportData() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 text-[#002D5F] mb-4">
        <Upload className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Importar Dados</h1>
      </div>
      <p className="text-slate-500">Área de upload para planilhas e extrações do SharePoint.</p>
    </div>
  )
}
