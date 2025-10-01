Perfeit'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onIdTokenChanged, User, Auth } from 'firebase/auth';
import { app } from './client';
import { setCookie, destroyCookie } from 'nookies';
import { Loader } from 'lucide-react';

// O contexto agora irá armazenar tanto a instância do Auth quanto o objeto do usuário.
interface AuthContextType {
  auth: Auth | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  auth: null, 
  user: null, 
  loading: true 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authInstance = getAuth(app);
        setAuth(authInstance);

        const unsubscribe = onIdTokenChanged(authInstance, async (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                const token = await user.getIdToken();
                // O cookie é útil para renderização no servidor e Server Actions
                setCookie(null, 'firebaseIdToken', token, {
                    maxAge: 30 * 24 * 60 * 60, // 30 dias
                    path: '/',
                });
            } else {
                destroyCookie(null, 'firebaseIdToken');
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }

    // Fornece o estado de autenticação, usuário e carregamento para toda a aplicação.
    return <AuthContext.Provider value={{ auth, user, loading }}>{children}</AuthContext.Provider>;
};

// Hook customizado para acessar facilmente o contexto de autenticação.
export const useAuth = () => {
    return useContext(AuthContext);
};
