erfeito, p'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider'; // Caminho atualizado para o novo provider
import { findUserTenantAction } from '@/app/auth/actions';
import { Loader } from 'lucide-react';

export default function SetupAccountPage() {
  const { user, loading } = useAuth(); // Agora usamos o hook que provê o usuário
  const router = useRouter();

  useEffect(() => {
    // Só executa a lógica se o usuário estiver carregado e logado
    if (loading || !user) return;

    console.log(`Usuário ${user.uid} autenticado. Iniciando verificação de tenant...`);

    const intervalId = setInterval(async () => {
      console.log('Verificando status da clínica para o usuário:', user.uid);
      
      // Passa o UID do usuário para a Server Action
      const tenant = await findUserTenantAction(user.uid);
      
      if (tenant && tenant.tenantId) {
        console.log(`Clínica encontrada: ${tenant.tenantId}. Redirecionando...`);
        clearInterval(intervalId);
        
        const protocol = window.location.protocol;
        const host = window.location.host.split(':')[0];
        // A porta é gerenciada pelo ambiente, não precisamos mais fixar 9002
        const port = window.location.port ? `:${window.location.port}` : ''; 
        const newHost = `${tenant.tenantId}.${host}`;
        
        // Redirecionamento robusto
        window.location.href = `${protocol}//${newHost}${port}`;
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(intervalId);
  }, [user, loading, router]); // Depende do estado de usuário e loading

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <Loader className="animate-spin h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold text-center font-headline">Estamos preparando sua clínica...</h1>
      </div>
      <p className="mt-4 text-muted-foreground">
        Isso pode levar alguns instantes. Você será redirecionado automaticamente.
      </p>
    </div>
  );
}
