'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onIdTokenChanged, User, Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Importa a instância auth diretamente
import { setCookie, destroyCookie } from 'nookies';
import { Loader } from 'lucide-react';

interface AuthContextType {
  auth: Auth;
  user: User | null;
  loading: boolean;
}

// O valor padrão do contexto é ajustado para refletir a nova estrutura
const AuthContext = createContext<AuthContextType>({ 
  auth: auth, // Passa a instância importada
  user: null, 
  loading: true 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // O estado do usuário e do carregamento permanece
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Não é mais necessário obter a instância do auth aqui, pois ela é importada diretamente
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                const token = await user.getIdToken();
                setCookie(null, 'firebaseIdToken', token, {
                    maxAge: 30 * 24 * 60 * 60, // 30 dias
                    path: '/',
                });
            } else {
                destroyCookie(null, 'firebaseIdToken');
            }
        });

        // A função de limpeza do useEffect cancela a inscrição no listener
        return () => unsubscribe();
    }, []); // O array de dependências vazio garante que o efeito rode apenas uma vez

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }

    // O valor do provedor agora inclui a instância auth importada
    return <AuthContext.Provider value={{ auth, user, loading }}>{children}</AuthContext.Provider>;
};

// O hook customizado para usar o contexto permanece o mesmo
export const useAuth = () => {
    return useContext(AuthContext);
};
