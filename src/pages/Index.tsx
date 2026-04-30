import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Index() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 overflow-hidden">
      {/* Decorative background blur blobs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-indigo-300/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 glass-panel rounded-2xl z-10 animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://prndiagnosticos.com.br/wp-content/themes/prnd/assets/images/logo.png"
            alt="PRN Logo"
            className="h-14 mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800">Acesso ao Sistema</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Gestão de Departamento Pessoal e Ativos
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">
              Email Corporativo
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.nome@prndiagnosticos.com.br"
              className="bg-white/50 border-white/40 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-slate-700">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                className="bg-white/50 border-white/40 focus:bg-white transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Acessar
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} PRN Diagnósticos.</p>
          <p>Uso restrito e confidencial.</p>
        </div>
      </div>
    </div>
  )
}
