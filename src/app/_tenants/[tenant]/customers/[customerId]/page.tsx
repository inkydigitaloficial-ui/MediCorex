'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Bot, LineChart, Target } from 'lucide-react';

import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generateCustomerInsightsAction } from '../../actions';

const formSchema = z.object({
  query: z.string().min(10, 'A consulta deve ter pelo menos 10 caracteres.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Insights com IA
        </>
      )}
    </Button>
  );
}

export default function CustomerDetailPage({ 
  params 
}: { 
  params: { tenant: string; customerId: string } 
}) {
  const { tenantData, loading: tenantLoading } = useTenant();
  const { toast } = useToast();
  
  // Passamos o estado inicial para o useFormState
  const [state, formAction] = useFormState(generateCustomerInsightsAction, { result: null, error: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const { pending } = useFormStatus();

  if (tenantLoading) {
    return <div className="p-6">Carregando dados do tenant...</div>
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
            Análise de Insights para Cliente: {params.customerId}
        </h1>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gerador de Consulta</CardTitle>
                    <CardDescription>Descreva o que você deseja analisar sobre este cliente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="tenantId" value={params.tenant} />
                            <input type="hidden" name="customerId" value={params.customerId} />
                            <FormField
                                control={form.control}
                                name="query"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sua Consulta</FormLabel>
                                    <FormControl>
                                    <Textarea
                                        placeholder="Ex: 'Analisar o comportamento de compra recente e sugerir produtos relacionados.'"
                                        className="resize-none"
                                        rows={5}
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <SubmitButton />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        Insights Gerados por IA
                    </CardTitle>
                    <CardDescription>
                        Os insights e recomendações aparecerão aqui.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                {pending ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-6 w-1/3 mt-6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ) : state.result ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 font-headline">
                                <LineChart className="h-5 w-5 text-accent" />
                                Insights Principais
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                {state.result.insights.map((insight, index) => (
                                    <li key={`insight-${index}`}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 font-headline">
                                <Target className="h-5 w-5 text-accent" />
                                Recomendações
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                {state.result.recommendations.map((rec, index) => (
                                    <li key={`rec-${index}`}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-muted-foreground/80 pt-4 border-t mt-6">
                            Gerado em: {new Date(state.result.generatedAt).toLocaleString()} | Duração: {state.result.metadata.analysisDuration}ms
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 bg-muted/30 rounded-md border-2 border-dashed">
                        <p className="text-muted-foreground text-center">
                            Seus insights aparecerão aqui.
                            <br />
                            Faça uma consulta para começar.
                        </p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
       </div>
    </main>
  );
}
