

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Bell, ArrowRight } from "lucide-react";
import Image from "next/image";

interface TenantDashboardProps {
  params: {
    tenantId: string;
  };
}

export default function TenantDashboard({ params }: TenantDashboardProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground font-headline">
          Dashboard da Clínica: <span className="font-bold text-primary">{params.tenantId}</span>
        </h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total de Pacientes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">+5 no último mês</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Agendamentos</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+78</div>
            <p className="text-xs text-muted-foreground">+12 na última semana</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Alertas Pendentes</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 novos hoje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Próximos Pacientes</CardTitle>
            <CardDescription>Visualização rápida dos seus próximos agendamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for upcoming patient list */}
            <div className="flex flex-col gap-4">
                {[
                  { name: 'Olivia Carter', time: '09:00 AM', reason: 'Consulta de Rotina', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
                  { name: 'Liam Johnson', time: '10:30 AM', reason: 'Retorno', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
                  { name: 'Sophia Martinez', time: '11:15 AM', reason: 'Primeira Consulta', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
                ].map(patient => (
                  <div key={patient.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-4">
                          <Image src={patient.avatar} alt={patient.name} width={40} height={40} className="rounded-full" />
                          <div>
                              <p className="font-semibold">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.reason}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="font-medium text-primary">{patient.time}</p>
                          <ArrowRight className="h-4 w-4 text-muted-foreground inline-block" />
                      </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="relative lg:col-span-2 overflow-hidden rounded-2xl flex flex-col justify-between p-6 bg-blue-600 text-white">
          <div className="absolute inset-0 bg-black/20 z-0">
             <Image src="https://picsum.photos/seed/dashboard-promo/600/400" alt="Abstract background" layout="fill" objectFit="cover" className="opacity-30" data-ai-hint="abstract background" />
          </div>
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-3">
              Lembretes Automáticos
            </div>
            <h3 className="text-2xl font-bold font-headline">Mantenha-se em dia com sua saúde!</h3>
            <p className="text-sm text-blue-100 mt-2">Receba lembretes automáticos para todas as suas consultas.</p>
          </div>
          <button className="relative z-10 self-start mt-4 inline-flex items-center text-sm font-semibold">
            Ativar agora <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </Card>
      </div>

    </div>
  );
}

