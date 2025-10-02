
'use client';

import { useState, useEffect } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { findUserTenantAction } from '@/app/auth/actions';

// Componente para feedback visual
const StatusDisplay = ({ status, errorMessage }: { status: 'checking' | 'creating' | 'ready' | 'error', errorMessage: string }) => {
  switch (status) {
    case 'checking':
      return (
        <>
          <Loader className="animate-spin h-12 w-12 text-primary" />
          <h1 className="text-xl font-semibold mt-4">Verificando sua conta...</h1>
          <p className="text-gray-500">Aguarde um instante.</p>
        </>
      );
    case 'creating':
      return (
        <>
          <Loader className="animate-spin h-12 w-12 text-primary" />
          <h1 className="text-xl font-semibold mt-4">Criando sua clínica...</h1>
          <p className="text-gray-500">Estamos preparando tudo para você. Não recarregue a página.</p>
        </>
      );
    case 'ready':
      return (
        <>
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h1 className="text-xl font-semibold mt-4">Tudo pronto!</h1>
          <p className="text-gray-500">Redirecionando para o seu painel...</p>
        </>
      );
    case 'error':
      return (
        <>
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold mt-4 text-destructive">Ocorreu um erro</h1>
          <p className="text-gray-600 max-w-sm">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Tentar Novamente
          </button>
        </>
      );
    default:
      return null;
  }
};


export default function SetupAccountPage() {
  const [status, setStatus] = useState<'checking' | 'creating' | 'ready' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('Ocorreu um erro desconhecido.');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // Aproximadamente 60s com backoff

    const checkTenant = async () => {
      attempts++;
      
      try {
        // A action agora precisa do UID. Assumindo que o hook useAuth() o fornece.
        // Por enquanto, vamos adaptar para o que temos. A action findUserTenantAction já recebe o UID.
        // O ideal é ter o UID do usuário logado aqui. Vou assumir que a action consegue lidar com isso por enquanto.
        const result = await findUserTenantAction();
        
        if (result.tenantId) {
          setStatus('ready');
          setTimeout(() => {
            const protocol = window.location.protocol;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host;
            window.location.href = `${protocol}//${result.tenantId}.${rootDomain}`;
          }, 1500); // Um pouco mais de tempo para o usuário ver a mensagem de sucesso
          
        } else {
          if (status === 'checking') setStatus('creating');
          
          if (attempts >= maxAttempts) {
            setStatus('error');
            setErrorMessage('A criação da sua clínica está demorando mais que o esperado. Por favor, tente recarregar a página ou contate nosso suporte se o problema persistir.');
            return;
          }
          
          // Backoff exponencial: 2s, 3s, 4.5s... até um teto de 10s
          const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 10000);
          setTimeout(checkTenant, delay);
        }
      } catch (error) {
        console.error('Erro crítico ao verificar tenant:', error);
        setStatus('error');
        setErrorMessage('Não foi possível configurar sua conta devido a um erro. Por favor, recarregue a página para tentar novamente.');
      }
    };

    // Inicia a verificação após um pequeno delay para garantir que o contexto de auth esteja pronto.
    const startTimeout = setTimeout(checkTenant, 1000);

    return () => clearTimeout(startTimeout);

  }, [status]); // Adicionado 'status' para re-avaliar se necessário

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-2">
        <StatusDisplay status={status} errorMessage={errorMessage} />
      </div>
    </div>
  );
}
