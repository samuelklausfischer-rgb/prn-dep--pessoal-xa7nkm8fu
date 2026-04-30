import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SmartSearch } from './dashboard/SmartSearch'
import { useAuth } from '@/contexts/auth-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DashboardLayout() {
  const { role, setRole } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full bg-slate-50 font-sans transition-all duration-200 ease-linear min-w-0">
        <header className="sticky top-0 z-40 w-full glass-panel border-b rounded-none shadow-sm h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 print:hidden gap-4">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4 text-slate-600 hover:text-[#002D5F]" />
          </div>
          <div className="flex-1 max-w-xl">
            <SmartSearch />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-500 hidden sm:block">
              Simular Perfil:
            </div>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-8 animate-fade-in-up print:p-0">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
