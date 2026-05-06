import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/dashboard/Timeline'
import Employees from './pages/dashboard/Employees'
import Exams from './pages/dashboard/Exams'
import Equipment from './pages/dashboard/Equipment'
import Infrastructure from './pages/dashboard/Infrastructure'
import Inspections from './pages/dashboard/Inspections'
import Documents from './pages/dashboard/Documents'
import ImportData from './pages/dashboard/ImportData'
import Validations from './pages/dashboard/Validations'
import Settings from './pages/dashboard/Settings'
import NotFound from './pages/NotFound'
import { DashboardLayout } from './components/DashboardLayout'
import { AuthProvider, useAuth } from './contexts/auth-context'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/" state={{ from: location }} replace />

  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/timeline" element={<Timeline />} />
            <Route path="/dashboard/employees" element={<Employees />} />
            <Route path="/dashboard/exams" element={<Exams />} />
            <Route path="/dashboard/equipment" element={<Equipment />} />
            <Route path="/dashboard/infrastructure" element={<Infrastructure />} />
            <Route path="/dashboard/inspections" element={<Inspections />} />
            <Route path="/dashboard/documents" element={<Documents />} />
            <Route path="/dashboard/import" element={<ImportData />} />
            <Route path="/dashboard/validations" element={<Validations />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
