import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SmartSearch } from './dashboard/SmartSearch'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardLayout() {
  const { role } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full bg-background font-sans transition-all duration-200 ease-linear min-w-0">
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-border shadow-sm h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 print:hidden gap-4 transition-colors duration-300">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-primary transition-colors" />
          </div>
          <div className="flex-1 max-w-xl">
            <SmartSearch />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm font-medium text-muted-foreground hidden sm:block capitalize">
              Perfil: {role}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-8 animate-fade-in-up print:p-0 transition-all duration-300">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
