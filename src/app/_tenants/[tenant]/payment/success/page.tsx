
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

// Esta página é exibida após um pagamento bem-sucedido no Stripe.
export default function PaymentSuccessPage() {
  const router = useRouter();

  // Após alguns segundos, redireciona o usuário para a página inicial da sua clínica.
  useEffect(() => {
    const timer = setTimeout(() => {
      // A URL já está no contexto do subdomínio correto, então basta redirecionar para a raiz.
      router.push('/');
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Pagamento Confirmado!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sua assinatura foi ativada. Estamos redirecionando você para sua clínica...
        </p>
      </div>
    </div>
  );
}
