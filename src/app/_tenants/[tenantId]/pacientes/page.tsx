'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Paciente } from '@/types/paciente';
import { Skeleton } from '@/components/ui/skeleton';


function PacienteListItem({ paciente, tenantId }: { paciente: Paciente, tenantId: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div>
                <p className="font-medium">{paciente.nome}</p>
                <p className="text-sm text-muted-foreground">{paciente.email}</p>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href={`/_tenants/${tenantId}/pacientes/${paciente.id}`}>
                    Ver Prontuário
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    )
}

function PacientesListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                    <Skeleton className='h-5 w-32 mb-2' />
                    <Skeleton className='h-4 w-48' />
                </div>
                <Skeleton className='h-9 w-36' />
            </div>
             <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                    <Skeleton className='h-5 w-28 mb-2' />
                    <Skeleton className='h-4 w-40' />
                </div>
                <Skeleton className='h-9 w-36' />
            </div>
        </div>
    )
}


export default function PacientesPage() {
    const { tenant } = useTenant();
    const firestore = useFirestore();

    const pacientesCollectionRef = useMemoFirebase(() => {
        if (!firestore || !tenant?.id) return null;
        return collection(firestore, `tenants/${tenant.id}/pacientes`);
    }, [firestore, tenant?.id]);

    const { data: pacientes, isLoading } = useCollection<Paciente>(pacientesCollectionRef);

    if (!tenant) {
        return null;
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Pacientes</h1>
                 <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Paciente
                </Button>
            </div>
            <div className="flex flex-1 items-start rounded-lg border border-dashed shadow-sm p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span>Lista de Pacientes</span>
                            </CardTitle>
                            <CardDescription>
                                Visualize e gerencie os pacientes da sua clínica.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <PacientesListSkeleton />
                            ) : pacientes && pacientes.length > 0 ? (
                                <div className="space-y-4">
                                    {pacientes.map((paciente) => (
                                        <PacienteListItem key={paciente.id} paciente={paciente} tenantId={tenant.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">Nenhum paciente cadastrado ainda.</p>
                                    <Button variant="link" className="mt-2">Adicionar o primeiro paciente</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
