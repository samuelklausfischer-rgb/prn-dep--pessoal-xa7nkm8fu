import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const MOCK_DATA = [
  { id: '1', title: 'Tomógrafo PRN', category: 'Equipamento' },
  { id: '2', title: 'Tomógrafo Medimagem', category: 'Equipamento' },
  { id: '3', title: 'Tomás - Técnico', category: 'Colaborador' },
  { id: '4', title: 'Licença Sanitária 2026', category: 'Documento' },
  { id: '5', title: 'Samuel - Admin', category: 'Colaborador' },
]

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const filtered = MOCK_DATA.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    if (query.length > 0) setIsOpen(true)
    else setIsOpen(false)
  }, [query])

  const handleSelect = (item: any) => {
    setQuery('')
    setIsOpen(false)
    toast({
      title: 'Navegação simulada',
      description: `Navegando para: ${item.title} (${item.category})`,
    })
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar ativos, colaboradores, equipamentos..."
          className="w-full pl-9 bg-slate-100/50 border-transparent focus:bg-white focus:border-[#002D5F] transition-all h-10 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 py-2 z-50 shadow-elevation animate-fade-in-up border-slate-200">
          <ul className="max-h-[300px] overflow-auto">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="px-4 py-3 hover:bg-[#002D5F]/5 cursor-pointer flex flex-col transition-colors border-b border-slate-100 last:border-0"
                onClick={() => handleSelect(item)}
              >
                <span className="font-medium text-slate-800">{item.title}</span>
                <span className="text-xs text-slate-500 mt-0.5">{item.category}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {isOpen && query.length > 0 && filtered.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-6 z-50 shadow-elevation text-center text-slate-500 text-sm border-slate-200">
          Nenhum resultado encontrado para "{query}"
        </Card>
      )}
    </div>
  )
}
