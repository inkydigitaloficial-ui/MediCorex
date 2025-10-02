
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Em um aplicativo de produção, esta página faria uma verificação no servidor
// para validar o `session_id` da query string com a API do Stripe
// para confirmar que o pagamento foi realmente bem-sucedido.

// async function validatePayment(sessionId: string) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     return session.payment_status === 'paid';
//   } catch (error) {
//     console.error("Erro ao validar sessão do Stripe:", error);
//     return false;
//   }
// }

export default async function PaymentSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;
  const isPaymentValid = !!sessionId; // Simulação: se o ID da sessão existe, consideramos válido.
  // Em produção: const isPaymentValid = await validatePayment(sessionId);

  if (!isPaymentValid) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <Card className="max-w-md bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle>Pagamento Inválido ou Expirado</CardTitle>
                <CardDescription>Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/escolha-seu-plano">Ver Planos</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-md">
        <Card className="bg-green-500/10 border-green-500">
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="font-headline text-2xl text-green-700">
              Pagamento Aprovado!
            </CardTitle>
            <CardDescription className="pt-2">
              Sua assinatura foi ativada. Obrigado por se juntar ao MediCorex!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Um webhook do Stripe processará a atualização final em seu perfil em alguns instantes.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                Ir para o Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
