
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
                    O Sistema Inteligente para a Gestão da sua Clínica
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    O MediCorex centraliza prontuários, agenda e finanças em um ambiente seguro e exclusivo. Use nossa IA para otimizar diagnósticos e focar no que mais importa: seus pacientes.
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
                      Ver Clínica de Demonstração
                    </Link>
                  </Button>
                </div>
                 <p className="max-w-[600px] text-xs text-muted-foreground pt-4">
                    Teste gratuito de 7 dias do plano Premium. Não é necessário cartão de crédito.
                  </p>
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
                  Construído para a Clínica Moderna
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nossa plataforma foi projetada para garantir segurança de dados, eficiência operacional e insights que transformam o atendimento.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <Card className="bg-background">
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
              <Card className="bg-background">
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
              <Card className="bg-background">
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
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 MediCorex. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
