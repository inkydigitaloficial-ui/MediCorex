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
          <span className="text-lg font-semibold font-headline">TenantFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="#features" prefetch={false}>
              Features
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="https://acme.localhost:9002" prefetch={false}>
              Demo
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
                    Unlock Tenant-Specific Insights with TenantFlow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our powerful multitenant platform provides secure, isolated environments and AI-driven analytics to understand your customers better.
                  </p>
                  <p className="max-w-[600px] text-sm text-muted-foreground pt-4">
                    To access your workspace, please use your assigned subdomain (e.g., <code className="bg-muted px-1 py-0.5 rounded-sm">acme.localhost:9002</code>).
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="https://acme.localhost:9002" prefetch={false}>
                      View Demo Tenant
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
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Built for Secure, Scalable Multi-Tenancy
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TenantFlow is architected from the ground up to provide robust data isolation, tenant-aware AI, and a seamless user experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <Building className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Subdomain Routing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic and seamless routing of users to their dedicated tenant space based on subdomains, ensuring a clean and isolated experience.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <Lock className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Firestore Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Leverage powerful Firestore security rules to enforce strict data isolation between tenants at the database level, preventing any unauthorized access.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full self-start">
                    <CircuitBoard className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline">Genkit AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Utilize Genkit flows to generate powerful customer insights. Our AI is tenant-aware, ensuring all generated data is relevant and secure.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TenantFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
