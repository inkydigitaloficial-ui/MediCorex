
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, CircuitBoard, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
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
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Desbloqueie Insights Específicos com MediCorex
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Nossa poderosa plataforma multitenant oferece ambientes seguros e isolados e análises orientadas por IA para entender melhor seus pacientes.
                  </p>
                  <p className="max-w-[600px] text-sm text-muted-foreground pt-4">
                    Para acessar seu espaço de trabalho, use seu subdomínio atribuído (ex: <code className="bg-muted px-1 py-0.5 rounded-sm">sua-clinica.localhost:9002</code>).
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/auth/signup" prefetch={false}>
                      Iniciar Teste Gratuito de 7 Dias
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="outline">
                    <Link href="https://acme.localhost:9002" prefetch={false}>
                      Ver Tenant de Demonstração
                    </Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Principais Recursos</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Construído para Multitenancy Segura e Escalável
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  O MediCorex é projetado desde o início para fornecer isolamento robusto de dados, IA consciente do tenant e uma experiência de usuário perfeita.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <Building className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Roteamento por Subdomínio</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Roteamento automático e contínuo de usuários para seu espaço de tenant dedicado com base em subdomínios, garantindo uma experiência limpa e isolada.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <Lock className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Segurança do Firestore</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Aproveite as poderosas regras de segurança do Firestore para impor um isolamento de dados rigoroso entre os tenants no nível do banco de dados.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <CircuitBoard className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Insights com IA Genkit</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Utilize fluxos Genkit para gerar insights poderosos sobre os pacientes. Nossa IA é consciente do tenant, garantindo que todos os dados gerados sejam relevantes e seguros.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 MediCorex. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
