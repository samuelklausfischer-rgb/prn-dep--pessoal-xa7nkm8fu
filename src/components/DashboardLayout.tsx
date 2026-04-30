import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full glass-panel border-b rounded-none shadow-sm print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://prndiagnosticos.com.br/wp-content/themes/prnd/assets/images/logo.png"
              alt="PRN Logo"
              className="h-10 object-contain"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-sm font-medium text-slate-700">
              Olá, Usuário
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 transition-transform hover:scale-105 duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 animate-fade-in-up print:p-0">
        <Outlet />
      </main>
    </div>
  )
}
