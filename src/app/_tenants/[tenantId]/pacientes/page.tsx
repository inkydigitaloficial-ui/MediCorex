'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Paciente } from '@/types/paciente';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Schema para validação do formulário
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
  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
    },
  });

  const onSubmit = async (data: PacienteFormData) => {
    if (!firestore || !tenantId) return;

    const pacientesCollectionRef = collection(firestore, `tenants/${tenantId}/pacientes`);
    
    const newPatientData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(pacientesCollectionRef, newPatientData)
      .then(() => {
        toast({
          title: 'Paciente adicionado!',
          description: `${data.nome} foi adicionado à sua lista de pacientes.`,
        });
        form.reset();
        onOpenChange(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: pacientesCollectionRef.path,
          operation: 'create',
          requestResourceData: newPatientData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Paciente</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para cadastrar um novo paciente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(99) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);

    const pacientesCollectionRef = useMemoFirebase(() => {
        if (!firestore || !tenant?.id) return null;
        return collection(firestore, `tenants/${tenant.id}/pacientes`);
    }, [firestore, tenant?.id]);

    const { data: pacientes, isLoading } = useCollection<Paciente>(pacientesCollectionRef);

    if (!tenant) {
        return null;
    }

    return (
        <>
            <AddPacienteDialog tenantId={tenant.id} open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
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
