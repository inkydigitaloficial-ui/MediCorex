import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { BarChart, LogOut, Settings } from 'lucide-react';

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
  params: { tenant: string };
};

export default async function TenantLayout({ children, params }: Props) {
  const tenantId = params.tenant;

  try {
    const tenantData = await getTenantData(tenantId);

    if (!tenantData || !tenantData.active) {
      notFound();
    }

    if (tenantData.plan === 'trial' && tenantData.trialEnds && new Date(tenantData.trialEnds.toDate()) < new Date()) {
       // In a real app, you'd redirect to a proper billing page
       // For now, we'll just show not found
       console.warn(`Trial expired for tenant: ${tenantId}`);
       notFound();
    }

    return (
      <TenantProvider value={{ tenantId, tenantData }}>
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
                  <SidebarMenuButton tooltip="Insights Dashboard" isActive>
                    <BarChart />
                    <span>Insights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${tenantId}`} alt="User Avatar" />
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
                <h2 className="text-xl font-semibold">Customer Insights</h2>
              </div>
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TenantProvider>
    );
  } catch (error) {
    console.error('Error loading tenant:', error);
    notFound();
  }
}