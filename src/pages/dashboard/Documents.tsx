import { FileText } from 'lucide-react'

export default function Documents() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 text-[#002D5F] mb-4">
        <FileText className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Alvarás e Documentos</h1>
      </div>
      <p className="text-slate-500">Gestão da documentação legal e clínica obrigatória.</p>
    </div>
  )
}
