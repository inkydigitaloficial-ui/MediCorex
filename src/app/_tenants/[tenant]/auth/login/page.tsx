
// Conteúdo para src/app/_tenants/[tenant]/auth/login/page.tsx

import { LoginForm } from "@/app/auth/login-form"; // Reutilizamos o formulário de login já existente
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TenantLoginPage({ params }: { params: { tenant: string } }) {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Acessar a clínica {params.tenant}</CardTitle>
                <CardDescription>Bem-vindo de volta! Use suas credenciais para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    </div>
  );
}
