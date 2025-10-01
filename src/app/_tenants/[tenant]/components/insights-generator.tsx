'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';

import { useTenant } from '@/hooks/use-tenant';
import { generateCustomerInsightsAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const formSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters long.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Insights
        </>
      )}
    </Button>
  );
}

// Este componente não é mais usado diretamente, mas pode ser útil como referência ou para outras páginas.
// A nova lógica está em /_tenants/[tenant]/customers/[customerId]/page.tsx
export function InsightsGenerator() {
  const { tenantId } = useTenant();

  return (
    <div className="w-full text-center">
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className='font-headline'>Funcionalidade Movida</CardTitle>
                <CardDescription>
                    A geração de insights agora é feita por cliente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Para analisar os dados de um cliente específico e gerar insights, por favor, navegue até a página de clientes.
                </p>
                <Button asChild>
                    <Link href={`/_tenants/${tenantId}/customers`}>
                        Ver Clientes
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
