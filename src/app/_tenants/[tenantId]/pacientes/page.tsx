
'use client';

import { useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase/hooks';
import { Paciente } from '@/types/paciente';
import { Button } from "@/components/ui/button";
import { UserPlus, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { AddPacienteDialog } from './_components/add-paciente-dialog';
import Link from 'next/link';
import { baseConverter } from '@/lib/firestore/converters';

function PacienteListItem({ paciente, tenantId }: { paciente: Paciente, tenantId: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div>
                <p className="font-medium">{paciente.nome}</p>
                <p className="text-sm text-muted-foreground">{paciente.email}</p>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href={`/pacientes/${paciente.id}`}>
                    Ver Prontuário
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    )
}

function PacientesLoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}

export default function PacientesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const firestore = useFirestore();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const pacientesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/pacientes`).withConverter(baseConverter<Paciente>()), 
      orderBy('createdAt', 'desc')
    );
  }, [firestore, tenantId]);

  const { data: pacientes, isLoading } = useCollection<Paciente>(pacientesQuery);

  return (
    <>
      <AddPacienteDialog 
        tenantId={tenantId} 
        open={isAddDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold md:text-2xl font-headline">Pacientes</h1>
               <Button onClick={() => setAddDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Paciente
              </Button>
          </div>
          <div className="flex flex-1 items-start rounded-lg border border-dashed shadow-sm p-4">
              <div className="w-full max-w-4xl mx-auto">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Users className="h-5 w-5 text-primary" /><span>Lista de Pacientes</span></CardTitle>
                          <CardDescription>Visualize e gerencie os pacientes da sua clínica.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {isLoading ? (
                            <PacientesLoadingSkeleton />
                          ) : pacientes && pacientes.length > 0 ? (
                              <div className="space-y-4">
                                  {pacientes.map((paciente) => (
                                      <PacienteListItem key={paciente.id} paciente={paciente} tenantId={tenantId} />
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center py-10">
                                  <p className="text-muted-foreground">Nenhum paciente cadastrado ainda.</p>
                                  <Button variant="link" className="mt-2" onClick={() => setAddDialogOpen(true)}>Adicionar o primeiro paciente</Button>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </main>
    </>
  );
}
