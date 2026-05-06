import { Palette, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas preferências de conta e sistema.</p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="premium-shadow border-border overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Aparência</CardTitle>
            </div>
            <CardDescription>
              Personalize a aparência do sistema para o seu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-6">
            <span className="text-sm font-medium">Tema do Sistema</span>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card className="premium-shadow border-border overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Perfil</CardTitle>
            </div>
            <CardDescription>Informações e dados da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Configurações de perfil disponíveis em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
