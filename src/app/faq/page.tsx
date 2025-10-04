
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqItems = [
    {
        question: "O MediCorex é seguro para armazenar dados de pacientes?",
        answer: "Sim. A segurança é nossa maior prioridade. Utilizamos criptografia de ponta para dados em trânsito e em repouso. Além disso, nossa arquitetura multi-tenant garante que os dados da sua clínica sejam completamente isolados e acessíveis apenas por usuários autorizados da sua equipe, através de regras de segurança rigorosas no nível do banco de dados."
    },
    {
        question: "Como funciona o assistente de IA para gerar resumos?",
        answer: "Nosso assistente de IA utiliza modelos de linguagem avançados (LLMs) para ler o histórico de anotações de um paciente e criar um resumo conciso e clinicamente relevante. Ele é projetado para destacar condições crônicas, tratamentos recentes e pontos de atenção, ajudando os profissionais a se atualizarem rapidamente sobre o caso de um paciente. Todo o processo é auditado e registrado."
    },
    {
        question: "O que acontece quando meu período de teste gratuito termina?",
        answer: "Após os 7 dias do teste gratuito, seu acesso aos recursos da clínica será limitado. Você será redirecionado para a página de faturamento para escolher um dos nossos planos pagos. Seus dados permanecerão seguros e intactos, e você recuperará o acesso total assim que ativar uma assinatura."
    },
    {
        question: "Posso fazer upgrade ou downgrade do meu plano a qualquer momento?",
        answer: "Sim, você pode alterar seu plano a qualquer momento através do painel de configurações da sua clínica. As alterações serão aplicadas no próximo ciclo de faturamento."
    },
    {
        question: "Quais são os limites de usuários em cada plano?",
        answer: "O plano Básico permite até 3 usuários. O plano Profissional e o Enterprise oferecem usuários ilimitados, permitindo que toda a sua equipe, de recepcionistas a médicos, colabore na plataforma sem custo adicional por pessoa."
    },
    {
        question: "O MediCorex oferece integração com outros sistemas?",
        answer: "Atualmente, o plano Enterprise oferece acesso à nossa API, permitindo integrações customizadas com outros sistemas, como softwares de laboratório ou sistemas financeiros. Estamos trabalhando para expandir nossas integrações nativas no futuro."
    }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">MediCorex</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/#features" prefetch={false}>
              Recursos
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/escolha-seu-plano" prefetch={false}>
              Preços
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login" prefetch={false}>
              Entrar
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-16 px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">Perguntas Frequentes</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Encontre respostas para as dúvidas mais comuns sobre nossa plataforma.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
