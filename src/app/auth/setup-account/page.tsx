'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/use-auth';
import { useToast } from '@/hooks/use-toast';

// Componente de UI para o spinner e a mensagem
function SetupStatus() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h1 className="text-2xl font-bold text-gray-800 mt-6">Estamos preparando tudo para você!</h1>
        <p className="text-gray-600 mt-2">Isso pode levar alguns instantes. Não feche esta página.</p>
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!auth?.currentUser) {
      // Se o usuário não estiver logado, aguarda ou redireciona para o login
      const timer = setTimeout(() => setAttempt(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    }

    const checkForClaimsAndRedirect = async () => {
      try {
        // Força a atualização do token para obter os claims mais recentes
        const idTokenResult = await auth.currentUser.getIdTokenResult(true);
        const claims = idTokenResult.claims;

        // Verifica se o claim 'tenants' existe e tem pelo menos uma entrada
        if (claims.tenants && Object.keys(claims.tenants).length > 0) {
          const tenantId = Object.keys(claims.tenants)[0]; // Pega o primeiro tenantId
          
          toast({ title: 'Clínica Pronta!', description: 'Redirecionando para seu painel...' });

          // Constrói a URL do subdomínio
          const protocol = window.location.protocol;
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host.split('.').slice(-2).join('.');
          const newUrl = `${protocol}//${tenantId}.${rootDomain}`;

          // Redireciona para o dashboard do tenant
          window.location.href = newUrl;

        } else {
          // Se os claims ainda não existem, tenta novamente após um intervalo
          if (attempt < 15) { // Tenta por até 30 segundos
            setTimeout(() => setAttempt(prev => prev + 1), 2000);
          } else {
            // Se exceder o tempo, informa o usuário e sugere um refresh ou contato
            toast({
              variant: 'destructive',
              title: 'Algo deu errado na configuração',
              description: 'Por favor, recarregue a página ou entre em contato com o suporte.',
              duration: 10000,
            });
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar claims:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Erro de Autenticação', 
          description: 'Não foi possível verificar seu status. Tente fazer login novamente.' 
        });
        router.push('/auth/login');
      }
    };

    checkForClaimsAndRedirect();

  }, [auth, router, toast, attempt]);

  return <SetupStatus />;
}
