
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Acesso Não Autorizado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página ou clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Se você acredita que isso é um erro, por favor, entre em contato com o administrador da clínica ou com nosso suporte.
          </p>
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
