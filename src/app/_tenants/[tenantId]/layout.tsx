
import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings, Users, Calendar, CircleDollarSign } from 'lucide-react';

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

type Props = {
  children: ReactNode;
  params: { tenantId: string };
};

export default async function TenantLayout({ children, params }: Props) {
  const tenantId = params.tenantId;

  try {
    const tenantData = await getTenantData(tenantId);

    // 🔐 VALIDAÇÃO CRÍTICA: Se o tenant não existe ou está inativo, exibe 404
    if (!tenantData || !tenantData.active) {
      notFound();
    }

    // 🚨 VALIDAÇÃO DE ASSINATURA (Exemplo): Se o plano expirou, redireciona
    if (tenantData.plan === 'trial' && tenantData.trialEnds && new Date(tenantData.trialEnds.toDate()) < new Date()) {
       console.warn(`Trial expired for tenant: ${tenantId}`);
       // Em uma app real, redirecionaria para uma página de cobrança
       // Ex: redirect(`/billing?tenant=${tenantId}`);
       notFound();
    }

    return (
      <TenantProvider initialData={{ tenantId, ...tenantData }}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-semibold font-headline">{tenantData.name || 'TenantFlow'}</h1>
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
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TenantProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar tenant:', error);
    notFound();
  }
}
