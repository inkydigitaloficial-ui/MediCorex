
'use client'; // Marcar como componente de cliente para usar useRouter

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (sessionId) {
      toast({
        title: "Pagamento bem-sucedido!",
        description: "Sua assinatura está sendo ativada. Você será redirecionado em breve.",
        duration: 5000,
      });

      // Redireciona para o dashboard após um tempo
      const timer = setTimeout(() => {
        // Idealmente, a URL do dashboard viria de um contexto ou serviço
        // Por enquanto, redireciona para a raiz, o middleware cuidará do resto
        router.push('/');
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (status === 'cancelled') {
        toast({
            variant: 'destructive',
            title: "Pagamento Cancelado",
            description: "Você cancelou o processo de pagamento. Você pode tentar novamente a qualquer momento.",
            duration: 8000
        });
        const timer = setTimeout(() => router.push('/escolha-seu-plano'), 2000);
        return () => clearTimeout(timer);
    }
    
    if (status === 'error') {
        toast({
            variant: 'destructive',
            title: "Erro no Pagamento",
            description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
            duration: 8000
        });
        const timer = setTimeout(() => router.push('/escolha-seu-plano'), 2000);
        return () => clearTimeout(timer);
    }


  }, [sessionId, status, router, toast]);

  if (!sessionId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 lg:p-6 bg-background">
        <Card className="max-w-md w-full border-destructive bg-destructive/5 text-center">
            <CardHeader>
              <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className='pt-4'>Sessão de Pagamento Inválida</CardTitle>
              <CardDescription>O link de pagamento é inválido ou expirou. Por favor, tente iniciar o processo novamente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/escolha-seu-plano">Ver Planos</Link>
                </Button>
            </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 lg:p-6 bg-background">
      <div className="w-full max-w-md">
        <Card className="bg-green-500/5 border-green-500 text-center">
          <CardHeader className="items-center">
            <div className="mx-auto bg-green-500/10 rounded-full p-3 w-fit">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="font-headline text-2xl text-green-700 pt-4">
              Pagamento Aprovado!
            </CardTitle>
            <CardDescription className="pt-2 text-foreground/80">
              Sua assinatura foi ativada. Obrigado por se juntar ao MediCorex!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Aguarde, estamos redirecionando você para o seu painel...
            </p>
            <Button asChild className="w-full" variant="link">
              <Link href="/">
                Ir para o Dashboard Agora
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
