import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings, Users, Calendar, CircleDollarSign } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

import { getCurrentUser } from '@/utils/session'; // Função de sessão para Server Components
import { TenantProvider } from '@/components/providers/tenant-provider';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Props = {
  children: ReactNode;
  params: { tenantId: string };
};

// Componente para o banner do período de teste
function TrialBanner({ trialEnds }: { trialEnds: Date | null }) {
  if (!trialEnds) return null;
  
  const daysLeft = differenceInDays(new Date(trialEnds), new Date());

  if (daysLeft < 0) {
    // Se o trial acabou, não mostra o banner, pois a página de billing será forçada.
    return null;
  }

  let message;
  if (daysLeft === 0) {
    message = 'Seu período de teste termina hoje.';
  } else if (daysLeft === 1) {
    message = 'Você tem 1 dia de teste restante.';
  } else {
    message = `Você tem ${daysLeft + 1} dias de teste restantes.`;
  }

  return (
    <div className='px-4 pt-4 lg:px-6'>
      <Alert className='border-primary/50 bg-primary/10 text-primary-foreground'>
        <AlertDescription className='text-center text-sm text-primary'>
          {message}
          <Link href="/escolha-seu-plano" className="underline font-semibold ml-2">Fazer Upgrade</Link>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default async function TenantLayout({ children, params }: Props) {
  // 1. Busca o contexto de autenticação usando a função centralizada.
  // Passamos o tenantId da URL para validação interna na função.
  const authContext = await getCurrentUser(params.tenantId);

  // 2. Se `getCurrentUser` retorna null, significa que o usuário não está logado
  // ou não tem permissão para este tenant. O middleware já deve ter redirecionado,
  // mas esta é uma camada extra de segurança.
  if (!authContext) {
    redirect('/auth/login'); // Redireciona para o login em caso de falha.
  }

  const { user, tenant, tenantId, role } = authContext;

  // A conversão de Timestamps do Firestore para Date objects agora é feita
  // dentro de `getCurrentUser` ou no conversor, garantindo que `tenant.trialEnds` seja um objeto Date.
  const trialEndsDate = tenant.trialEnds ? new Date(tenant.trialEnds) : null;
  
  return (
    // 3. O TenantProvider envolve todo o layout, disponibilizando os dados para componentes de cliente.
    <TenantProvider tenant={tenant} tenantId={tenantId} role={role}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-semibold font-headline tracking-tight">{tenant.name || 'MediCorex'}</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {/* Links simplificados para caminhos relativos ao tenant */}
              <SidebarMenuItem><Link href="/dashboard"><SidebarMenuButton tooltip="Dashboard"><BarChart /><span>Dashboard</span></SidebarMenuButton></Link></SidebarMenuItem>
              <SidebarMenuItem><Link href="/pacientes"><SidebarMenuButton tooltip="Pacientes"><Users /><span>Pacientes</span></SidebarMenuButton></Link></SidebarMenuItem>
              <SidebarMenuItem><Link href="/agenda"><SidebarMenuButton tooltip="Agenda"><Calendar /><span>Agenda</span></SidebarMenuButton></Link></SidebarMenuItem>
              <SidebarMenuItem><Link href="/financeiro"><SidebarMenuButton tooltip="Financeiro"><CircleDollarSign /><span>Financeiro</span></SidebarMenuButton></Link></SidebarMenuItem>
              <SidebarMenuItem><Link href="/configuracoes"><SidebarMenuButton tooltip="Configurações"><Settings /><span>Configurações</span></SidebarMenuButton></Link></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.picture} alt="Avatar" />
                <AvatarFallback>{user.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name || 'Usuário'}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/auth/logout"><LogOut className="h-4 w-4" /></Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className='flex flex-col flex-1'>
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
              <SidebarTrigger className="md:hidden" />
              <div className="w-full flex-1">
              {/* Espaço para breadcrumbs ou título da página */}
              </div>
          </header>
          {role === 'owner' && tenant.subscriptionStatus === 'trialing' && <TrialBanner trialEnds={trialEndsDate} />}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
          </main>
        </div>
      </SidebarProvider>
    </TenantProvider>
  );
}
