
import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings, Users, Calendar, CircleDollarSign, AlertTriangle } from 'lucide-react';

import { getTenantData } from '@/lib/tenants';
import { TenantProvider } from '@/hooks/use-tenant';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { differenceInDays } from 'date-fns';

type Props = {
  children: ReactNode;
  params: { tenantId: string };
};

function TrialBanner({ trialEnds }: { trialEnds: Date }) {
  const daysLeft = differenceInDays(trialEnds, new Date());

  if (daysLeft < 0) return null; // Não mostra se o trial já acabou

  return (
    <div className='px-4 pt-4'>
      <Alert className='border-primary/50 bg-primary/5 text-primary-foreground'>
        <AlertDescription className='text-center text-sm text-primary'>
          {daysLeft > 1 ? `Você tem mais ${daysLeft} dias de teste gratuito.` : daysLeft === 1 ? 'Este é seu último dia de teste gratuito.' : 'Seu período de teste gratuito acabou.'}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default async function TenantLayout({ children, params }: Props) {
  const tenantId = params.tenantId;

  try {
    const tenantData = await getTenantData(tenantId);

    // 🔐 VALIDAÇÃO CRÍTICA: Se o tenant não existe ou está inativo, exibe 404
    if (!tenantData || !tenantData.active) {
      notFound();
    }

    const trialEndsDate = tenantData.trialEnds?.toDate();

    // 🚨 VALIDAÇÃO DE ASSINATURA: Se o plano é trial e a data de teste já passou
    if (tenantData.subscriptionStatus === 'trialing' && trialEndsDate && new Date() > trialEndsDate) {
       console.warn(`Trial expired for tenant: ${tenantId}`);
       // Em uma app real, redirecionaria para uma página de cobrança
       // redirect(`https://${tenantId}.localhost:9002/escolha-seu-plano`);
       return (
        <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mx-auto max-w-md text-center">
              <Alert variant="destructive" className="flex flex-col items-center">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <AlertTitle className='font-headline text-lg'>Período de Teste Expirado</AlertTitle>
                <AlertDescription className='mt-2'>
                  Seu período de teste de 7 dias terminou. Por favor, escolha um plano para continuar usando o MediCorex.
                </AlertDescription>
              </Alert>
              <Button asChild className='mt-6'>
                <Link href="/escolha-seu-plano">Ver Planos</Link>
              </Button>
            </div>
        </div>
       );
    }

    return (
      <TenantProvider initialData={{ id: tenantId, ...tenantData }}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-semibold font-headline">{tenantData.name || 'MediCorex'}</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                   <Link href={`/_tenants/${tenantId}`} passHref>
                        <SidebarMenuButton tooltip="Dashboard">
                            <BarChart />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href={`/_tenants/${tenantId}/pacientes`} passHref>
                        <SidebarMenuButton tooltip="Pacientes">
                            <Users />
                            <span>Pacientes</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href={`/_tenants/${tenantId}/agenda`} passHref>
                        <SidebarMenuButton tooltip="Agenda">
                            <Calendar />
                            <span>Agenda</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href={`/_tenants/${tenantId}/financeiro`} passHref>
                        <SidebarMenuButton tooltip="Financeiro">
                            <CircleDollarSign />
                            <span>Financeiro</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href={`/_tenants/${tenantId}/configuracoes`} passHref>
                    <SidebarMenuButton tooltip="Configurações">
                      <Settings />
                      <span>Configurações</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${tenantId}`} alt="Avatar do Usuário" />
                  <AvatarFallback>{tenantId.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{tenantData.name || tenantId} User</p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">{tenantId}@example.com</p>
                </div>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70" asChild>
                  <Link href="/">
                      <LogOut className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="w-full flex-1">
                {/* O título pode ser dinâmico com base na página */}
              </div>
            </header>
            {tenantData.subscriptionStatus === 'trialing' && trialEndsDate && <TrialBanner trialEnds={trialEndsDate} />}
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TenantProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar tenant:', error);
    notFound();
  }
}
