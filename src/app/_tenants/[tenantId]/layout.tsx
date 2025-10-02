

import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings, Users, Calendar, CircleDollarSign } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

import { getCurrentUser } from '@/utils/session'; // Nossa função de sessão robusta
import { TenantProvider } from '@/components/providers/tenant-provider'; // Nosso novo provedor
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Props = {
  children: ReactNode;
  params: { tenantId: string };
};

// Componente para o banner do período de teste
function TrialBanner({ trialEnds }: { trialEnds: Date }) {
  const daysLeft = differenceInDays(new Date(trialEnds), new Date());

  if (daysLeft < 0) return null;

  return (
    <div className='px-4 pt-4 lg:px-6'>
      <Alert className='border-primary/50 bg-primary/10 text-primary-foreground'>
        <AlertDescription className='text-center text-sm text-primary'>
          {daysLeft >= 1 ? `Você tem ${daysLeft + 1} dias de teste.` : 'Seu período de teste termina hoje.'}
          <Link href="/billing" className="underline font-semibold ml-2">Fazer Upgrade</Link>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default async function TenantLayout({ children, params }: Props) {
  // 1. Busca o contexto de autenticação usando a função centralizada.
  // Passamos o tenantId da URL para validação interna na função.
  const authContext = await getCurrentUser(params.tenantId);

  // 2. Validação simplificada.
  // Se `getCurrentUser` retorna null, significa que o usuário não está logado
  // ou não tem permissão para este tenant. A função já logou o motivo.
  if (!authContext) {
    redirect('/auth/login'); // Redireciona para o login em caso de falha.
  }

  const { user, tenant, tenantId, role } = authContext;

  const trialEndsDate = tenant.trialEnds ? new Date(tenant.trialEnds.seconds * 1000) : null;

  return (
    // 3. O TenantProvider envolve todo o layout, disponibilizando os dados.
    <TenantProvider tenant={tenant} tenantId={tenantId} role={role}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-semibold font-headline">{tenant.name || 'MediCorex'}</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {/* 4. Links simplificados para caminhos relativos */}
              <SidebarMenuItem><Link href="/"><SidebarMenuButton tooltip="Dashboard"><BarChart /><span>Dashboard</span></SidebarMenuButton></Link></SidebarMenuItem>
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
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Espaço para breadcrumbs ou título da página */}
            </div>
          </header>
          {role === 'owner' && tenant.subscriptionStatus === 'trialing' && trialEndsDate && <TrialBanner trialEnds={trialEndsDate} />}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TenantProvider>
  );
}
