import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  Clock,
  Users,
  Activity,
  Monitor,
  Building,
  Wrench,
  FileText,
  Upload,
  CheckSquare,
  Settings,
  UserCircle,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'

const navData = [
  {
    title: 'Visão Geral',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Linha do Tempo', url: '/dashboard/timeline', icon: Clock },
    ],
  },
  {
    title: 'Departamento Pessoal (DP)',
    items: [
      { title: 'Colaboradores', url: '/dashboard/employees', icon: Users },
      { title: 'Exames & Treinamentos', url: '/dashboard/exams', icon: Activity },
    ],
  },
  {
    title: 'Infraestrutura',
    items: [
      { title: 'Infraestrutura Física', url: '/dashboard/infrastructure', icon: Building },
      { title: 'Equipamentos & Máquinas', url: '/dashboard/equipment', icon: Monitor },
      { title: 'Vistorias Técnicas', url: '/dashboard/inspections', icon: Wrench },
      { title: 'Alvarás e Documentos', url: '/dashboard/documents', icon: FileText },
    ],
  },
  {
    title: 'Operações (Financeiro)',
    items: [
      { title: 'Importar Dados', url: '/dashboard/import', icon: Upload },
      { title: 'Validar Extrações', url: '/dashboard/validations', icon: CheckSquare },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, isMobile } = useSidebar()
  const { user, role, signOut } = useAuth()

  const isCollapsed = state === 'collapsed' && !isMobile

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border shadow-lg">
      <SidebarHeader className="py-4 flex justify-center">
        <div
          className={`flex items-center justify-center transition-all duration-300 bg-white shadow-sm rounded-lg p-2 ${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-[85%] mx-auto'}`}
        >
          <img
            src="https://prndiagnosticos.com.br/wp-content/themes/prnd/assets/images/logo.png"
            alt="PRN Logo"
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-5' : 'h-8'} drop-shadow-sm`}
          />
        </div>
      </SidebarHeader>
      <SidebarSeparator className="bg-sidebar-border/50" />
      <SidebarContent>
        {navData.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-[10px] uppercase tracking-wider font-semibold group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-all duration-200 ${isActive ? 'data-[active=true]:border-l-4 data-[active=true]:border-primary bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Configurações"
              isActive={location.pathname === '/dashboard/settings'}
              className={`transition-all duration-200 ${location.pathname === '/dashboard/settings' ? 'data-[active=true]:border-l-4 data-[active=true]:border-primary bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
            >
              <Link to="/dashboard/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="truncate">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div
              className={`flex items-center gap-3 px-2 py-3 mt-2 border-t border-sidebar-border/50 ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <UserCircle className="h-8 w-8 text-sidebar-foreground/70 shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60 truncate capitalize">
                    {role}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  className="p-1.5 hover:bg-sidebar-accent/50 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors ml-auto"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
