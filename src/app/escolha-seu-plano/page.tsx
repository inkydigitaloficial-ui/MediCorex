
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import Link from 'next/link';

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
  <Card className={`flex flex-col ${recommended ? 'border-primary ring-2 ring-primary' : ''}`}>
    <CardHeader>
      <CardTitle className="font-headline">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1 space-y-6">
      <p className="text-4xl font-bold">
        {price}
        {price !== 'Contato' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
      </p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => onChoosePlan(planId)}
        disabled={isPending && currentPlan === planId}
        variant={recommended ? 'default' : 'outline'}
      >
        {isPending && currentPlan === planId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (planId === 'enterprise' ? 'Falar com Vendas' : 'Escolher Plano')}
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
      window.location.href = '/contato'; // Supondo que exista uma página de contato
      return;
    }
    
    setCurrentPlan(planId);
    setIsPending(true);
    
    toast({
        title: 'Integração de Pagamento Pendente',
        description: `A lógica de checkout para o plano ${planId} com um provedor como Pagar.me será implementada aqui.`,
    });

    // Simulação de delay
    setTimeout(() => {
        setIsPending(false);
        setCurrentPlan(null);
    }, 2000);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
       <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">MediCorex</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/auth/login" prefetch={false}>
              Já tenho conta
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup" prefetch={false}>
              Criar Conta
            </Link>
          </Button>
        </nav>
      </header>
      <main className="container mx-auto py-16 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">Nossos Planos</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Escolha o plano que melhor se adapta às necessidades da sua clínica, sem surpresas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PlanCard 
            title="Básico" 
            description="Ideal para profissionais individuais e clínicas em início de operação."
            price="R$79"
            features={['Até 5 usuários', 'Agenda Online Inteligente', 'Prontuário Eletrônico', 'Faturamento Básico', 'Suporte via Email']}
            planId="basico"
            onChoosePlan={handleChoosePlan}
            isPending={isPending}
            currentPlan={currentPlan}
          />
          <PlanCard 
            title="Profissional"
            description="O mais popular para clínicas em crescimento que buscam eficiência."
            price="R$129"
            features={['Usuários Ilimitados', 'Tudo do plano Básico', 'Assistente com IA para resumos', 'Relatórios Avançados', 'Suporte Prioritário']}
            planId="profissional"
            onChoosePlan={handleChoosePlan}
            isPending={isPending}
            currentPlan={currentPlan}
            recommended
          />
          <PlanCard 
            title="Enterprise"
            description="Soluções sob medida para grandes clínicas, hospitais e redes."
            price="Contato"
            features={['Tudo do plano Profissional', 'Gestão de Múltiplas Unidades', 'API para integrações', 'Gerente de Conta Dedicado', 'SLA de Disponibilidade']}
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
