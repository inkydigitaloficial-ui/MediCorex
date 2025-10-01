'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { findUserTenantAction } from '../actions';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SetupAccountPage() {
  const { user, isUserLoading } = useUser();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Se o usuário não estiver logado após o carregamento, redirecione para o login.
    if (!isUserLoading && !user) {
      window.location.href = '/auth/login';
      return;
    }

    // Se o usuário estiver logado, comece a verificar o tenant.
    if (user) {
      const intervalId = setInterval(async () => {
        const result = await findUserTenantAction(user.uid);
        
        if (result.tenantId) {
          clearInterval(intervalId);
          toast({
            title: 'Clínica Pronta!',
            description: 'Redirecionando para o seu painel...',
          });

          // Constrói a URL do subdomínio e redireciona.
          const protocol = window.location.protocol;
          const host = window.location.host.includes('localhost')
            ? 'localhost:9002'
            : window.location.host;
          const rootDomain = host.split('.').slice(-2).join('.');
          window.location.href = `${protocol}//${result.tenantId}.${rootDomain}`;

        } else if (result.error && result.error !== 'Tenant não encontrado ainda.') {
          // Se houver um erro real do servidor, pare de verificar e mostre o erro.
          clearInterval(intervalId);
          setError(result.error);
        }
        // Se o erro for 'Tenant não encontrado ainda.', continue verificando.
      }, 2000); // Verifica a cada 2 segundos

      return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente.
    }
  }, [user, isUserLoading, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Quase lá!</CardTitle>
        <CardDescription className="text-center">
          Estamos configurando tudo para você.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-10">
        {error ? (
          <>
            <p className="text-destructive text-center">{error}</p>
            <p className="text-sm text-muted-foreground text-center">Por favor, contate o suporte.</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">
              Aguarde um momento, estamos preparando sua clínica...
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
