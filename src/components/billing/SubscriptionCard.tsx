'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { createCheckoutSessionAction } from '@/app/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from 'lucide-react';

export function SubscriptionCard() {
  const { user } = useAuth();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user || !params.tenant) {
      console.error('Subscription Error: User or tenant not identified.');
      alert('Erro: Usuário ou clínica não identificado. Por favor, recarregue a página.');
      return;
    }

    setLoading(true);

    const tenantId = params.tenant as string;
    const result = await createCheckoutSessionAction(tenantId, user.email!);

    if (result.error) {
      alert(`Erro ao iniciar pagamento: ${result.error}`);
      setLoading(false);
      return;
    }

    if (result.url) {
      // Redireciona para a página de checkout do Stripe
      window.location.href = result.url;
    } else {
        alert('Não foi possível obter a URL de pagamento. Tente novamente.');
        setLoading(false);
    }
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
          <p className="text-3xl font-bold my-4">R$ 99/mês</p>
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