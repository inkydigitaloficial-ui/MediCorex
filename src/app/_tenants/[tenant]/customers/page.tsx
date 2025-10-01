import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock de dados de clientes para demonstração
const mockCustomers = [
    { id: "customer-001", name: "Innovate Inc.", email: "contact@innovate.com" },
    { id: "customer-002", name: "Quantum Solutions", email: "support@quantum.dev" },
];

export default function CustomersPage({ params }: { params: { tenant: string } }) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Customers</h1>
            </div>
            <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer List</CardTitle>
                            <CardDescription>
                                This is a placeholder for your customer list. In a real application, this would be a dynamic list fetched from your database.
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
                                            <Link href={`/_tenants/${params.tenant}/customers/${customer.id}`}>
                                                View Insights
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Click on "View Insights" to see the AI-powered analysis for a customer.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
