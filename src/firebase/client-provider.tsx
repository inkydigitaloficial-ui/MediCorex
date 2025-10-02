'use client';

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Este componente serve como um ponto de entrada para os providers do lado do cliente.
 * Atualmente, ele apenas encapsula o AuthProvider, que gerencia a sessão de autenticação do usuário.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // O AuthProvider agora é auto-contido e não precisa mais receber props de inicialização.
  // Ele obtém a instância do app Firebase diretamente do @/firebase/client.
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
