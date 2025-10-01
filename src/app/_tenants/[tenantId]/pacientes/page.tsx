import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock de dados de clientes para demonstração
const mockCustomers = [
    { id: "paciente-001", name: "João da Silva", email: "joao.silva@example.com" },
    { id: "paciente-002", name: "Maria Oliveira", email: "maria.oliveira@example.com" },
];

export default function PacientesPage({ params }: { params: { tenantId: string } }) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Pacientes</h1>
            </div>
            <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Pacientes</CardTitle>
                            <CardDescription>
                                Esta é uma lista de pacientes fictícia. Em uma aplicação real, os dados seriam buscados do banco de dados.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockCustomers.map((customer) => (
                                    <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/_tenants/${params.tenantId}/pacientes/${customer.id}`}>
                                                Ver Detalhes
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Clique em "Ver Detalhes" para ver a análise de IA para um paciente.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
