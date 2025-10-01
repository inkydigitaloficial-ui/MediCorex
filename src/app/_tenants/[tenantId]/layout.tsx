import { notFound, redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { getTenantData } from '@/lib/tenants';
import { TenantProvider } from '@/hooks/use-tenant';

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
        <div className="flex h-screen bg-gray-50">
          {/* O TenantSidebar será adicionado em uma fase futura */}
          {/* <TenantSidebar tenantId={tenantId} /> */}
          <div className="flex-1 flex flex-col overflow-hidden">
             {/* O TenantHeader será adicionado em uma fase futura */}
             {/* <TenantHeader tenantData={tenantData} /> */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </TenantProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar tenant:', error);
    notFound();
  }
}
