
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';

// 1. Define o formato dos dados que o contexto irá fornecer.
interface TenantContextType {
  tenant: Tenant | null; // Informações do tenant (nome, plano, etc.)
  tenantId: string | null; // ID do tenant (slug do subdomínio)
  role: string | null;     // Papel do usuário no tenant (owner, admin, etc.)
}

// 2. Cria o Contexto React com um valor padrão 'undefined'.
// Isso nos ajuda a garantir que o hook 'useTenant' só será usado dentro do provedor.
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// 3. Define as propriedades que o componente Provedor irá receber.
interface TenantProviderProps {
  children: ReactNode;
  tenant: Tenant | null;
  tenantId: string | null;
  role: string | null;
}

/**
 * O TenantProvider é um componente de cliente que utiliza o Context API do React
 * para disponibilizar informações do tenant e do usuário para todos os componentes aninhados.
 * Ele recebe os dados pré-buscados no servidor (via Server Components) e os injeta no contexto,
 * evitando a necessidade de novas buscas de dados no lado do cliente.
 */
export const TenantProvider = ({ children, tenant, tenantId, role }: TenantProviderProps) => {
  // O valor do contexto é montado com os dados recebidos via props.
  const value = { tenant, tenantId, role };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Hook personalizado `useTenant` para acessar facilmente os dados do contexto.
 * Garante que qualquer componente que o utilize esteja dentro de um TenantProvider.
 */
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    // Este erro é acionado se o hook for usado fora do provedor, prevenindo bugs.
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
};
