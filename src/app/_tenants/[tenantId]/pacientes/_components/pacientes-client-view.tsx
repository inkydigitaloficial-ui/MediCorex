
'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/hooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Paciente } from '@/types/paciente';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { baseConverter } from '@/lib/firestore/converters';

const pacienteSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

function AddPacienteDialog({ tenantId, onOpenChange, open }: { tenantId: string; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter(); 
  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { nome: '', email: '', cpf: '', telefone: '' },
  });

  const onSubmit = async (data: PacienteFormData) => {
    if (!firestore || !tenantId) return;

    const pacientesCollectionRef = collection(firestore, `tenants/${tenantId}/pacientes`).withConverter(baseConverter<Paciente>());
    
    addDoc(pacientesCollectionRef, data as Omit<Paciente, 'id'>)
    .then(() => {
        toast({
            title: 'Paciente adicionado!',
            description: `${data.nome} foi adicionado à sua lista de pacientes.`,
        });
        form.reset();
        onOpenChange(false);
        router.refresh(); 
    })
    .catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: pacientesCollectionRef.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Paciente</DialogTitle>
          <DialogDescription>Preencha as informações para cadastrar um novo paciente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="nome" control={form.control} render={({ field }) => <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField name="email" control={form.control} render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField name="cpf" control={form.control} render={({ field }) => <FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField name="telefone" control={form.control} render={({ field }) => <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <Button type="submit" disabled={form.formState.isSubmitting} className='w-full'>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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

    if (!tenantId) {
        return null;
    }

    return (
        <>
            <AddPacienteDialog tenantId={tenantId} open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
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
