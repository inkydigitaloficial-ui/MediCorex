
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, CircuitBoard, Lock, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";
import { Footer } from '@/components/footer';
import { DomainUtils } from '@/middleware/utils/domain-utils';

function DemoLink() {
  const [demoUrl, setDemoUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const rootDomain = DomainUtils.getRootDomain(window.location.host);
      const newUrl = `${protocol}//acme.${rootDomain}`;
      setDemoUrl(newUrl);
    }
  }, []);

  if (!demoUrl) {
    return <Button size="lg" variant="outline" disabled>Ver Demonstração</Button>;
  }

  return (
    <Button asChild size="lg" variant="outline">
      <Link href={demoUrl} prefetch={false}>
        Ver Demonstração
      </Link>
    </Button>
  );
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">MediCorex</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="#features" prefetch={false}>
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
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-up">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    O Sistema Inteligente para a Gestão da sua Clínica
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    O MediCorex centraliza prontuários, agenda e finanças em um ambiente seguro e exclusivo. Use nossa IA para otimizar diagnósticos e focar no que mais importa: seus pacientes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <Button asChild size="lg">
                    <Link href="/auth/signup" prefetch={false}>
                      Iniciar Teste Gratuito de 7 Dias
                    </Link>
                  </Button>
                  <DemoLink />
                </div>
                 <p className="max-w-[600px] text-xs text-muted-foreground pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    Teste gratuito de 7 dias do plano Profissional. Não é necessário cartão de crédito.
                  </p>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last animate-fade-in"
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Principais Recursos</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Construído para a Clínica Moderna
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nossa plataforma foi projetada para garantir segurança de dados, eficiência operacional e insights que transformam o atendimento.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Card className="bg-background h-full">
                  <CardHeader className="gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                      <Building className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline">Ambiente Exclusivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Cada clínica opera em um espaço isolado e seguro, com seu próprio subdomínio, garantindo total privacidade e controle dos seus dados.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Card className="bg-background h-full">
                  <CardHeader className="gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                      <Lock className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline">Segurança Avançada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Utilizamos as melhores práticas de segurança para proteger os dados dos seus pacientes, com criptografia e regras de acesso restritas.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Card className="bg-background h-full">
                  <CardHeader className="gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                      <CircuitBoard className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline">Assistente com IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Nossa inteligência artificial analisa o histórico do paciente e gera resumos inteligentes, ajudando você a tomar decisões mais rápidas e informadas.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center animate-fade-in-up">
            <div className="space-y-2 mb-12">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Planos e Preços</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Encontre o plano perfeito para sua clínica
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Oferecemos uma variedade de planos para atender às suas necessidades, desde clínicas pequenas até grandes hospitais.
                </p>
            </div>
            
            <div className="mx-auto grid max-w-6xl items-stretch gap-8 sm:grid-cols-1 lg:grid-cols-3">
              <Card className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="font-headline">Básico</CardTitle>
                   <CardDescription>Ideal para profissionais individuais.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-4xl font-bold">R$79<span className="text-lg font-normal text-muted-foreground">/mês</span></div>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Até 3 usuários</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Agenda e Prontuários</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>IA Padrão (50 resumos/mês)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Suporte via Email</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/auth/signup" prefetch={false}>
                          Iniciar Teste Gratuito
                        </Link>
                    </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col animate-fade-in-up border-primary ring-2 ring-primary shadow-xl" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="font-headline">Profissional</CardTitle>
                   <CardDescription>O mais popular para clínicas em crescimento.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-4xl font-bold">R$129<span className="text-lg font-normal text-muted-foreground">/mês</span></div>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Usuários Ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Tudo do plano Básico</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Assistente com IA Avançada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Relatórios Avançados</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/auth/signup" prefetch={false}>
                          Iniciar Teste Gratuito
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
              
               <Card className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="font-headline">Enterprise</CardTitle>
                  <CardDescription>Para grandes hospitais e redes.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-4xl font-bold">Personalizado</div>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Todos os recursos do plano Profissional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Gestão Multi-unidades</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Suporte Dedicado</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Integrações Customizadas</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="#" prefetch={false}>
                          Entre em Contato
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            </div>
             <Button asChild variant="link" className="mt-6">
                <Link href="/escolha-seu-plano">Ver todos os planos e recursos</Link>
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
