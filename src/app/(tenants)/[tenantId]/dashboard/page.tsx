
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, BarChart2, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from "recharts"
import { useTenant } from "@/components/providers/tenant-provider";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase/hooks';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Paciente } from '@/types/paciente';
import { Agendamento } from '@/types/agendamento';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { baseConverter } from '@/lib/firestore/converters';
import Link from 'next/link';

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 700 },
];

interface TenantDashboardProps {
  params: {
    tenantId: string;
  };
}

export default function TenantDashboard({ params }: TenantDashboardProps) {
  const { tenant, tenantId } = useTenant();
  const firestore = useFirestore();

  // --- QUERIES DINÂMICAS ---

  // 1. Query para todos os pacientes (para contagem total)
  const pacientesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, `tenants/${tenantId}/pacientes`).withConverter(baseConverter<Paciente>());
  }, [firestore, tenantId]);
  const { data: pacientes, isLoading: isLoadingPacientes } = useCollection<Paciente>(pacientesQuery);

  // 2. Query para agendamentos do mês atual
  const agendamentosMesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    const hoje = new Date();
    const inicioDoMes = startOfMonth(hoje);
    const fimDoMes = endOfMonth(hoje);
    return query(
      collection(firestore, `tenants/${tenantId}/agendamentos`),
      where('start', '>=', inicioDoMes),
      where('start', '<=', fimDoMes)
    ).withConverter(baseConverter<Agendamento>());
  }, [firestore, tenantId]);
  const { data: agendamentosDoMes, isLoading: isLoadingAgendamentos } = useCollection<Agendamento>(agendamentosMesQuery);
  
  // 3. Query para novos pacientes no último mês
  const novosPacientesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    const umMesAtras = subMonths(new Date(), 1);
    const umMesAtrasTimestamp = Timestamp.fromDate(umMesAtras);

    // Ajuste aqui: O Firestore SDK do cliente usa 'where' com objetos Date, não Timestamp
    return query(
        collection(firestore, `tenants/${tenantId}/pacientes`),
        where('createdAt', '>=', umMesAtras)
    ).withConverter(baseConverter<Paciente>());
  }, [firestore, tenantId]);
  const { data: novosPacientes, isLoading: isLoadingNovosPacientes } = useCollection<Paciente>(novosPacientesQuery);


  // --- CÁLCULOS ---
  const totalPacientes = pacientes?.length ?? 0;
  const totalAgendamentosMes = agendamentosDoMes?.length ?? 0;
  const totalNovosPacientes = novosPacientes?.length ?? 0;
  const isLoading = isLoadingPacientes || isLoadingAgendamentos || isLoadingNovosPacientes;


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
          {tenant?.name ? `Dashboard de ${tenant.name}` : `Dashboard da Clínica`}
        </h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta! Aqui está um resumo da sua clínica.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalPacientes}</div>}
            <p className="text-xs text-muted-foreground">{`+${totalNovosPacientes} no último mês`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos (Mês)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalAgendamentosMes}</div>}
            <p className="text-xs text-muted-foreground">Agendamentos neste mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalNovosPacientes}</div>}
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer" asChild>
          <Link href="/agenda">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Ações Rápidas</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Novo Agendamento</div>
              <p className="text-xs text-primary/80">Clique para adicionar</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Evolução de Pacientes</CardTitle>
            <CardDescription>Novos pacientes cadastrados nos últimos 6 meses (dados de exemplo).</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Consultas por Período</CardTitle>
            <CardDescription>Volume de consultas realizadas (dados de exemplo).</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <Bar dataKey="value" style={{ fill: "hsl(var(--primary))", opacity: 0.9 }} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
