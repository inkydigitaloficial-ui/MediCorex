'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/hooks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { baseConverter } from '@/lib/firestore/converters';
import { Paciente } from '@/types/paciente';

const pacienteSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

interface AddPacienteDialogProps {
    tenantId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddPacienteDialog({ tenantId, onOpenChange, open }: AddPacienteDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { nome: '', email: '', cpf: '', telefone: '' },
  });

  const onSubmit = (data: PacienteFormData) => {
    if (!firestore || !tenantId) return;

    const pacientesCollectionRef = collection(firestore, `tenants/${tenantId}/pacientes`);
    
    // O baseConverter não é mais necessário aqui, pois vamos lidar com o timestamp diretamente
    addDoc(pacientesCollectionRef, {
      ...data,
      createdAt: serverTimestamp() // Adiciona o timestamp na criação
    })
    .then(() => {
        toast({
            title: 'Paciente adicionado!',
            description: `${data.nome} foi adicionado à sua lista de pacientes.`,
        });
        form.reset();
        onOpenChange(false);
    })
    .catch((error) => {
      // User-facing error
      toast({
        variant: 'destructive',
        title: 'Falha ao adicionar paciente',
        description: 'Você não tem permissão para executar esta ação.',
      });

      // Developer-facing error for debugging
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
            <FormField name="cpf" control={form.control} render={({ field }) => <FormItem><FormLabel>CPF (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField name="telefone" control={form.control} render={({ field }) => <FormItem><FormLabel>Telefone (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <Button type="submit" disabled={form.formState.isSubmitting} className='w-full'>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
