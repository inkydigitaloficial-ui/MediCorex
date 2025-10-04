
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlanCard = ({ 
  title, 
  description, 
  price, 
  features, 
  recommended, 
  planId,
  onChoosePlan,
  isPending,
  currentPlan
}: {
  title: string, 
  description: string, 
  price: string, 
  features: string[], 
  recommended?: boolean, 
  planId: 'basico' | 'profissional' | 'enterprise',
  onChoosePlan: (planId: 'basico' | 'profissional' | 'enterprise') => void,
  isPending: boolean,
  currentPlan: string | null
}) => (
  <Card className={`flex flex-col ${recommended ? 'border-primary' : ''}`}>
    <CardHeader>
      <CardTitle className="font-headline">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      <p className="text-4xl font-bold mb-4">
        {price}
        {price !== 'Contato' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
      </p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        onClick={() => onChoosePlan(planId)}
        disabled={isPending && currentPlan === planId}
      >
        {isPending && currentPlan === planId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (recommended ? 'Começar Agora' : 'Escolher Plano')}
      </Button>
    </CardFooter>
  </Card>
);

export default function EscolhaPlanoPage() {
  const [isPending, setIsPending] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChoosePlan = (planId: 'basico' | 'profissional' | 'enterprise') => {
    if (planId === 'enterprise') {
      // Redirecionar para contato ou fazer outra ação
      window.location.href = '/contato';
      return;
    }
    
    setCurrentPlan(planId);
    setIsPending(true);
    
    toast({
        title: 'Integração Pendente',
        description: `A lógica de checkout para o plano ${planId} com Pagar.me será implementada.`,
    });

    // Aqui entraria a lógica para chamar a API do Pagar.me
    console.log(`Plano escolhido: ${planId}. Pronto para integrar com Pagar.me.`);

    // Simulação de delay
    setTimeout(() => {
        setIsPending(false);
        setCurrentPlan(null);
    }, 2000);
  };

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Nossos Planos</h1>
          <p className="text-lg text-muted-foreground mt-2">Escolha o plano que melhor se adapta às suas necessidades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <PlanCard 
            title="Básico" 
            description="Para profissionais individuais e pequenas clínicas."
            price="R$79"
            features={['Até 50 pacientes', 'Agenda Online', 'Prontuário Eletrônico', 'Suporte por Email']}
            planId="basico"
            onChoosePlan={handleChoosePlan}
            isPending={isPending}
            currentPlan={currentPlan}
          />
          <PlanCard 
            title="Profissional"
            description="O mais popular para clínicas em crescimento."
            price="R$129"
            features={['Pacientes Ilimitados', 'Tudo do plano Básico', 'Faturamento e Relatórios', 'Suporte Prioritário']}
            planId="profissional"
            onChoosePlan={handleChoosePlan}
            isPending={isPending}
            currentPlan={currentPlan}
            recommended
          />
          <PlanCard 
            title="Enterprise"
            description="Para grandes clínicas e hospitais."
            price="Contato"
            features={['Tudo do plano Profissional', 'Multi-unidades', 'API de integração', 'Gerente de Conta Dedicado']}
            planId="enterprise"
            onChoosePlan={handleChoosePlan}
            isPending={isPending}
            currentPlan={currentPlan}
          />
        </div>
      </main>
    </div>
  );
}
