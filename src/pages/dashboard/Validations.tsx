import { CheckSquare } from 'lucide-react'

export default function Validations() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 text-[#002D5F] mb-4">
        <CheckSquare className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Validar Extrações</h1>
      </div>
      <p className="text-slate-500">Fila de verificação de dados processados pela IA.</p>
    </div>
  )
}
