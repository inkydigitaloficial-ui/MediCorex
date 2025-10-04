
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Cpu, HardDrive, Loader2, Sparkles, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const plans = [
    {
        id: 'basico',
        title: 'Básico',
        description: 'Ideal para profissionais individuais e clínicas em início de operação.',
        price: 'R$79',
        features: ['Até 3 usuários', 'Agenda Online Inteligente', 'Prontuário Eletrônico', 'Suporte via Email'],
        highlightedFeatures: [
            { icon: Users, text: 'Até 3 usuários' },
            { icon: HardDrive, text: '10 GB de armazenamento' },
            { icon: Cpu, text: 'IA Padrão (50 resumos/mês)' },
        ],
        recommended: false,
    },
    {
        id: 'profissional',
        title: 'Profissional',
        description: 'O mais popular para clínicas em crescimento que buscam eficiência e IA.',
        price: 'R$129',
        features: ['Usuários Ilimitados', 'Tudo do plano Básico', 'Assistente com IA para resumos', 'Relatórios Avançados', 'Suporte Prioritário'],
        highlightedFeatures: [
            { icon: Users, text: 'Usuários ilimitados' },
            { icon: HardDrive, text: '50 GB de armazenamento' },
            { icon: Sparkles, text: 'IA Avançada (resumos ilimitados)' },
        ],
        recommended: true,
    },
    {
        id: 'enterprise',
        title: 'Enterprise',
        description: 'Soluções sob medida para grandes clínicas, hospitais e redes.',
        price: 'Contato',
        features: ['Tudo do plano Profissional', 'Gestão de Múltiplas Unidades', 'API para integrações', 'Gerente de Conta Dedicado'],
        highlightedFeatures: [
            { icon: Users, text: 'Organização completa' },
            { icon: HardDrive, text: 'Armazenamento dedicado' },
            { icon: Star, text: 'Gerente de Conta e SLA' },
        ],
        recommended: false,
    }
];

const allFeatures = [
    { feature: 'Limite de Usuários', basico: 'Até 3', profissional: 'Ilimitado', enterprise: 'Personalizado' },
    { feature: 'Armazenamento de Prontuários', basico: '10 GB', profissional: '50 GB', enterprise: 'Dedicado' },
    { feature: 'Agenda Online Inteligente', basico: true, profissional: true, enterprise: true },
    { feature: 'Faturamento e Emissão', basico: true, profissional: true, enterprise: true },
    { feature: 'Assistente de IA (resumos)', basico: '50/mês', profissional: 'Ilimitado', enterprise: 'Ilimitado' },
    { feature: 'Chat com IA (suporte clínico)', basico: false, profissional: 'Beta', enterprise: 'Beta' },
    { feature: 'Análise de Dados com IA', basico: false, profissional: true, enterprise: true },
    { feature: 'Relatórios Avançados', basico: false, profissional: true, enterprise: true },
    { feature: 'Suporte Técnico', basico: 'Email', profissional: 'Prioritário (Chat e Email)', enterprise: 'Dedicado (Gerente de Conta)' },
    { feature: 'API para Integrações', basico: false, profissional: false, enterprise: true },
    { feature: 'Gestão de Múltiplas Unidades', basico: false, profissional: false, enterprise: true },
    { feature: 'SLA de Disponibilidade', basico: 'Padrão', profissional: 'Padrão', enterprise: '99.9% Garantido' },
];


const PlanCard = ({ plan, onChoosePlan, isPending, currentPlanId }) => (
  <Card className={cn('flex flex-col transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl', plan.recommended && 'border-primary ring-2 ring-primary shadow-xl')}>
    <CardHeader>
      <CardTitle className="font-headline">{plan.title}</CardTitle>
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1 space-y-6">
      <div className="text-4xl font-bold">
        {plan.price}
        {plan.price !== 'Contato' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
      </div>
      <ul className="space-y-3">
        {plan.highlightedFeatures.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <feature.icon className={cn("h-5 w-5 flex-shrink-0", plan.recommended ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm">{feature.text}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => onChoosePlan(plan.id)}
        disabled={isPending && currentPlanId === plan.id}
        variant={plan.recommended ? 'default' : 'outline'}
      >
        {isPending && currentPlanId === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (plan.id === 'enterprise' ? 'Falar com Vendas' : 'Escolher Plano')}
      </Button>
    </CardFooter>
  </Card>
);

export default function EscolhaPlanoPage() {
  const [isPending, setIsPending] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChoosePlan = (planId: string) => {
    if (planId === 'enterprise') {
      // Idealmente, redirecionar para uma página de contato ou formulário
      toast({
        title: 'Contato Enterprise',
        description: 'Nossa equipe de vendas entrará em contato em breve.',
      });
      return;
    }
    
    setCurrentPlanId(planId);
    setIsPending(true);
    
    toast({
        title: 'Integração de Pagamento Pendente',
        description: `A lógica de checkout para o plano ${planId} com um provedor como Pagar.me será implementada aqui.`,
    });

    // Simula uma chamada de API
    setTimeout(() => {
        setIsPending(false);
        setCurrentPlanId(null);
    }, 2000);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
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
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">Nossos Planos</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Escolha o plano que melhor se adapta às necessidades da sua clínica, sem surpresas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {plans.map(plan => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              onChoosePlan={handleChoosePlan}
              isPending={isPending}
              currentPlanId={currentPlanId}
            />
          ))}
        </div>

        <div className="mt-24 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-center text-3xl font-bold font-headline mb-8">Compare todos os recursos</h2>
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-1/3 font-headline'>Recurso</TableHead>
                            <TableHead className='text-center font-headline'>Básico</TableHead>
                            <TableHead className='text-center font-headline'>Profissional <span className="text-xs font-normal text-primary">(Recomendado)</span></TableHead>
                            <TableHead className='text-center font-headline'>Enterprise</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allFeatures.map(({ feature, basico, profissional, enterprise }) => (
                            <TableRow key={feature}>
                                <TableCell className='font-medium'>{feature}</TableCell>
                                <TableCell className='text-center'>
                                    {typeof basico === 'boolean' ? (basico ? <Check className='h-5 w-5 text-green-500 mx-auto' /> : '—') : basico}
                                </TableCell>
                                <TableCell className='text-center'>
                                    {typeof profissional === 'boolean' ? (profissional ? <Check className='h-5 w-5 text-green-500 mx-auto' /> : '—') : profissional}
                                </TableCell>
                                <TableCell className='text-center'>
                                    {typeof enterprise === 'boolean' ? (enterprise ? <Check className='h-5 w-5 text-green-500 mx-auto' /> : '—') : enterprise}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
      </main>
    </div>
  );
}

    