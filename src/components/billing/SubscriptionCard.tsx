
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/firebase/hooks'; // Corrigido para usar o hook central
import { createCheckoutSession } from '@/lib/stripe/actions'; // Corrigido para usar a Server Action
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SubscriptionCard() {
  const { user } = useUser();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user || !params.tenantId) {
      toast({
        variant: 'destructive',
        title: 'Erro de Assinatura',
        description: 'Usuário ou clínica não identificado. Por favor, recarregue a página.'
      });
      return;
    }

    setLoading(true);

    const tenantId = params.tenantId as string;
    
    // Inicia uma transição para a Server Action
    // A ação irá redirecionar o usuário para o Stripe
    await createCheckoutSession('premium' as any); // Ajuste o plano conforme necessário
    
    // O setLoading pode ser removido ou ajustado, já que a página será redirecionada.
    // Se o redirecionamento falhar, o estado de loading pode precisar ser resetado.
    // A Server Action lida com o redirecionamento, então o cliente não precisa fazer nada.
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Seu período de teste terminou</CardTitle>
        <CardDescription>
          Para continuar usando sua clínica, por favor, escolha um dos nossos planos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-bold">Plano Premium</h3>
          <p className="text-muted-foreground">Acesso completo a todos os recursos.</p>
          <p className="text-3xl font-bold my-4">R$ 199/mês</p>
          <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={loading}>
            {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Assinar Plano Premium'}
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Dúvidas? Entre em contato com nosso <a href="/support" className="underline">suporte</a>.
        </p>
      </CardContent>
    </Card>
  );
}
