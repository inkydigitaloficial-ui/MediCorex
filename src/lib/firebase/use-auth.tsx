
'use client';

import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { Auth } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

import { firebaseClient } from '@/lib/firebase/client';

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const authInstance = getAuth(firebaseClient);
    setAuth(authInstance);

    const unsubscribe = onIdTokenChanged(authInstance, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        // Define o cookie que será lido pelo middleware e server actions
        document.cookie = `firebaseIdToken=${token}; path=/;`;
      } else {
        // Limpa o cookie no logout
        document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
