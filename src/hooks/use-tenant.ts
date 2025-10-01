"use client";

import { createContext, useContext, ReactNode } from 'react';

type TenantContextType = {
  tenantId: string;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  return (
    <TenantContext.Provider value={{ tenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
