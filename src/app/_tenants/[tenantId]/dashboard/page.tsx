
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TenantDashboardProps {
  params: {
    tenantId: string;
  };
}

export default function TenantDashboard({ params }: TenantDashboardProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold">Dashboard da Clínica: {params.tenantId}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">+5 no último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+78</div>
            <p className="text-xs text-muted-foreground">+12 na última semana</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-muted-foreground pt-4">
        Página de Dashboard do Tenant. O roteamento está funcionando!
      </p>
    </div>
  );
}
