
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/hooks';
import { useToast } from '@/hooks/use-toast';
import { findUserTenantAction } from '../actions';
import { Loader2 } from 'lucide-react';

// Componente de UI para o spinner e a mensagem
function SetupStatus() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50">
      <div className="text-center p-8 bg-background rounded-lg shadow-md max-w-sm w-full">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
        <h1 className="text-2xl font-bold font-headline text-foreground mt-6">Quase lá!</h1>
        <p className="text-muted-foreground mt-2">Estamos preparando sua clínica e configurando seu ambiente. Isso pode levar alguns instantes.</p>
        <p className="text-muted-foreground mt-1">Por favor, não feche esta página.</p>
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
    if (!auth) {
      // Auth object might not be available immediately.
      return;
    }

    const { user } = auth;
    if (!user) {
      // Se o usuário não estiver logado, aguarda ou redireciona
      const timer = setTimeout(() => {
          if (!user && attempt > 3) router.push('/auth/login');
          setAttempt(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const checkForTenant = async () => {
      try {
        const result = await findUserTenantAction(user.uid);

        if (result.tenantId) {
          toast({ title: 'Clínica Pronta!', description: 'Redirecionando para seu painel...' });
          
          const protocol = window.location.protocol;
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host;
          const newUrl = `${protocol}//${result.tenantId}.${rootDomain}/dashboard`;

          // Redireciona para o dashboard do tenant
          window.location.href = newUrl;

        } else {
          // Se o tenant ainda não foi encontrado, tenta novamente
          if (attempt < 15) { // Tenta por até 30 segundos
            setTimeout(() => setAttempt(prev => prev + 1), 2000);
          } else {
            toast({
              variant: 'destructive',
              title: 'Algo deu errado na configuração',
              description: result.error || 'Não foi possível encontrar sua clínica. Por favor, recarregue a página ou entre em contato com o suporte.',
              duration: 10000,
            });
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar tenant:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Erro de Servidor', 
          description: 'Não foi possível verificar o status da sua clínica. Tente novamente mais tarde.' 
        });
      }
    };

    const checkInterval = setInterval(() => {
      checkForTenant();
    }, 2000); // Verifica a cada 2 segundos

    // Limpa o intervalo quando o componente é desmontado ou o tenant é encontrado
    return () => clearInterval(checkInterval);

  }, [auth, router, toast, attempt]);

  return <SetupStatus />;
}
