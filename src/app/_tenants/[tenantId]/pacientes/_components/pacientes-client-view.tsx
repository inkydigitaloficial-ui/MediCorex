
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Paciente } from '@/types/paciente';
import { AddPacienteDialog } from './add-paciente-dialog';

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

export function PacientesClientView({ pacientes, tenantId }: { pacientes: Paciente[], tenantId: string }) {
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const router = useRouter();
    
    // A função router.refresh() será chamada no dialog após a adição.
    const onPatientAdded = () => {
        router.refresh();
    }

    if (!tenantId) {
        return null;
    }

    return (
        <>
            <AddPacienteDialog tenantId={tenantId} open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onPatientAdded={onPatientAdded} />
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
                                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Lista de Pacientes</span></CardTitle>
                                <CardDescription>Visualize e gerencie os pacientes da sua clínica.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pacientes && pacientes.length > 0 ? (
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
