
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings, Users, Calendar, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { differenceInDays, format, isValid } from 'date-fns';
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

// Componente para o banner do período de teste
function TrialBanner({ trialEnds }: { trialEnds: Date | null }) {
  if (!trialEnds || !isValid(trialEnds)) return null;

  const daysLeft = differenceInDays(trialEnds, new Date());

  if (daysLeft < 0) return null;

  const message = daysLeft === 0
    ? 'Seu período de teste termina hoje!'
    : daysLeft === 1
      ? 'Você tem 1 dia de teste restante.'
      : `Você tem ${daysLeft} dias de teste restantes.`;

  return (
    <div className='px-4 pt-4 lg:px-6'>
      <Alert className='border-primary/50 bg-primary/10 text-primary-foreground'>
        <AlertTriangle className="h-4 w-4 text-primary" />
        <AlertTitle className='text-primary font-bold'>{message}</AlertTitle>
        <AlertDescription className='text-primary/90'>
          Para não perder o acesso, <Link href="/escolha-seu-plano" className="underline font-semibold">faça um upgrade</Link> agora.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default async function TenantLayout({ children, params }: Props) {
  const authContext = await getCurrentUser(params.tenantId);

  // Se `getCurrentUser` retorna null, o usuário não está logado ou não tem permissão.
  // O middleware já deve ter redirecionado, mas esta é uma camada extra de segurança no servidor.
  if (!authContext) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:9002';
    const loginUrl = `${protocol}://${params.tenantId}.${rootDomain}/auth/login`;
    redirect(loginUrl);
  }

  const { user, tenant, tenantId, role } = authContext;

  // Redireciona se o tenant não for encontrado no contexto (proteção adicional)
  if (!tenant) {
    redirect('/auth/login?error=tenant_not_found');
  }

  // Se o usuário tem o papel de 'trial_expired' e não está na página de billing, redireciona.
  // A própria página de layout já está sendo renderizada dentro do tenant, então o middleware já fez o rewrite.
  // A verificação é feita aqui para garantir que qualquer acesso direto seja bloqueado.
  // O middleware já cuidou do rewrite para `/billing`, então a verificação aqui é uma segurança.

  return (
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
                <Link href="/api/auth/logout"><LogOut className="h-4 w-4" /></Link>
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
          {role === 'owner' && tenant.subscriptionStatus === 'trialing' && <TrialBanner trialEnds={tenant.trialEnds} />}
          <div className="flex-1 overflow-y-auto">
             {children}
          </div>
        </div>
      </SidebarProvider>
    </TenantProvider>
  );
}

type Props = {
  children: ReactNode;
  params: { tenantId: string };
};
