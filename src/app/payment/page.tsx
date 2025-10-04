'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useActionState } from 'react';
import { simulateSuccessfulPayment } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = (useActionState as any).useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : 'Pagar Agora e Reativar Clínica'}
    </Button>
  );
}

function PaymentComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const tenantId = searchParams.get('tenantId');
  const plan = searchParams.get('plan') || 'Profissional';
  const planPrice = plan === 'profissional' ? 'R$ 129,00' : 'R$ 79,00';

  const [state, formAction, isPending] = useActionState(async (_: any, formData: FormData) => {
    const tenantId = formData.get('tenantId') as string;
    const plan = formData.get('plan') as string;
    return simulateSuccessfulPayment(tenantId, plan);
  }, { success: false, error: null });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Pagamento Aprovado!',
        description: 'Sua assinatura foi reativada com sucesso.',
      });
      router.push(`/payment/success?tenantId=${tenantId}`);
    }
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Pagamento',
        description: state.error,
      });
    }
  }, [state, router, tenantId, toast]);

  if (!tenantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>ID da clínica não encontrado. Por favor, volte e tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-2xl font-semibold font-headline">MediCorex</span>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-green-600 mb-2" />
            <CardTitle className="font-headline text-2xl">Finalizar Pagamento</CardTitle>
            <CardDescription>Você está a um passo de reativar sua clínica.</CardDescription>
          </CardHeader>
          <form action={formAction}>
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="plan" value={plan} />
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Plano {plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
                  <span>{planPrice} / mês</span>
                </div>
                <p className="text-sm text-muted-foreground">Cobrança recorrente. Cancele quando quiser.</p>
              </div>
              <div className='text-xs text-muted-foreground text-center pt-2'>
                Este é um ambiente de simulação. Nenhum dado de pagamento real é necessário.
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PaymentComponent />
        </Suspense>
    )
}
