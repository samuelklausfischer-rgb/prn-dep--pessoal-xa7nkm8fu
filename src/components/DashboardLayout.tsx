import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen w-full bg-slate-50 font-sans transition-all duration-300">
        <header className="sticky top-0 z-40 w-full glass-panel border-b rounded-none shadow-sm h-16 flex items-center px-4 shrink-0 print:hidden">
          <SidebarTrigger className="mr-4 text-slate-600 hover:text-[#002D5F]" />
          <div className="flex-1 flex items-center justify-end">
            {/* Optional header actions can go here */}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in-up print:p-0">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
