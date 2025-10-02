
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function BillingPage({ params }: { params: { tenantId: string } }) {

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <CardTitle className="font-headline text-2xl">
              Seu Período de Teste Terminou
            </CardTitle>
            <CardDescription>
              Para continuar acessando todos os recursos do MediCorex, por favor, escolha um de nossos planos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Seu acesso está limitado até que uma assinatura seja ativada.
            </p>
            <Button asChild className="w-full">
              <Link href="/escolha-seu-plano">
                Ver Planos e Preços
              </Link>
            </Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/contato">
                    Falar com o suporte
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
