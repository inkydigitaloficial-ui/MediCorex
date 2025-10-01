'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Tenant } from '@/types/tenant'; // Tipo definido

interface TenantContextType {
  tenant: Tenant | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: Tenant;
}) {
  const firestore = useFirestore();
  const [tenant, setTenant] = useState<Tenant>(initialData);

  // Ouve por atualizações em tempo real no documento do tenant
  useEffect(() => {
    if (!firestore || !initialData?.id) return;

    const unsubscribe = onSnapshot(doc(firestore, 'tenants', initialData.id), (snapshot) => {
      if (snapshot.exists()) {
        setTenant({ id: snapshot.id, ...snapshot.data() } as Tenant);
      }
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar
  }, [initialData.id, firestore]);
  
  // Memoiza o valor para evitar re-renderizações desnecessárias
  const value = useMemo(() => ({ tenant }), [tenant]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
}
