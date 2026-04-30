import { Monitor } from 'lucide-react'

export default function Equipment() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 text-[#002D5F] mb-4">
        <Monitor className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Equipamentos & Máquinas</h1>
      </div>
      <p className="text-slate-500">Galeria de ativos técnicos da PRN e Medimagem.</p>
    </div>
  )
}
