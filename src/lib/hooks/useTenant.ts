
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/hooks';

interface TenantContextType {
  tenantId: string;
  tenantData: any | null; // Consider defining a strong type for tenant data
  loading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children, 
  value 
}: { 
  children: ReactNode;
  value: { tenantId: string; tenantData: any };
}) {
  const firestore = useFirestore();
  const [tenantData, setTenantData] = useState(value.tenantData);
  const [loading, setLoading] = useState(!value.tenantData); // Initial loading state
  const [error, setError] = useState<Error | null>(null);

  // Real-time listener for tenant data updates
  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(firestore, 'tenants', value.tenantId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTenantData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setError(new Error(`Tenant with ID ${value.tenantId} no longer exists.`));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error in tenant listener:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, value.tenantId]);

  const contextValue = {
    tenantId: value.tenantId,
    tenantData,
    loading,
    error
  };

  return (
    <TenantContext.Provider value={contextValue}>
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
