'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function SuccessComponent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const [dashboardUrl, setDashboardUrl] = useState('#');

  useEffect(() => {
    // A URL do dashboard precisa ser construída no lado do cliente
    // para obter o host correto.
    if (tenantId && typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host.replace(/^www\./, '');
      const newUrl = `${protocol}//${tenantId}.${host}/dashboard`;
      setDashboardUrl(newUrl);
    }
  }, [tenantId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <CardTitle className="font-headline text-2xl">Pagamento Aprovado!</CardTitle>
          <CardDescription>
            Sua assinatura foi reativada com sucesso. Você já pode acessar todos os recursos da sua clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Agradecemos por escolher o MediCorex para otimizar a gestão da sua clínica.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href={dashboardUrl}>
              Ir para o meu Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense>
            <SuccessComponent />
        </Suspense>
    );
}
