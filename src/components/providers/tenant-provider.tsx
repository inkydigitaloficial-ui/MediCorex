
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';

// 1. Define o formato dos dados que o contexto irá fornecer.
interface TenantContextType {
  tenant: Tenant | null; // Informações do tenant (nome, etc.)
  tenantId: string | null; // ID do tenant
  role: string | null;     // Papel do usuário no tenant (owner, member, etc.)
}

// 2. Cria o Contexto React com um valor padrão.
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// 3. Cria o componente Provedor.
interface TenantProviderProps {
  children: ReactNode;
  tenant: Tenant | null;
  tenantId: string | null;
  role: string | null;
}

export const TenantProvider = ({ children, tenant, tenantId, role }: TenantProviderProps) => {
  return (
    <TenantContext.Provider value={{ tenant, tenantId, role }}>
      {children}
    </TenantContext.Provider>
  );
};

// 4. Cria o hook personalizado `useTenant`.
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    // Este erro garante que o hook só seja usado dentro de um TenantProvider.
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
};
