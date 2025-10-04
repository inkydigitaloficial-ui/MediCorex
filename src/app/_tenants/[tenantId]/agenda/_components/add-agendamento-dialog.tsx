
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, setHours, setMinutes } from 'date-fns';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase/hooks';
import { Paciente } from '@/types/paciente';
import { Agendamento } from '@/types/agendamento';
import { baseConverter } from '@/lib/firestore/converters';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/hooks';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';

const agendamentoSchema = z.object({
  paciente: z.object({
    id: z.string().min(1),
    nome: z.string().min(1),
  }, { required_error: 'Selecione um paciente.' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)."),
  title: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres.' }),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface AddAgendamentoDialogProps {
    tenantId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date;
}

export function AddAgendamentoDialog({ tenantId, onOpenChange, open, selectedDate }: AddAgendamentoDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const [pacientePopoverOpen, setPacientePopoverOpen] = useState(false);

  // Busca pacientes para o seletor
  const pacientesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, `tenants/${tenantId}/pacientes`).withConverter(baseConverter<Paciente>());
  }, [firestore, tenantId]);
  const { data: pacientes, isLoading: isLoadingPacientes } = useCollection<Paciente>(pacientesQuery);

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: { time: '09:00', title: '' },
  });

  const onSubmit = (data: AgendamentoFormData) => {
    if (!firestore || !tenantId || !user) return;

    const [hours, minutes] = data.time.split(':').map(Number);
    const startDate = setMinutes(setHours(selectedDate, hours), minutes);

    const agendamentosCollectionRef = collection(firestore, `tenants/${tenantId}/agendamentos`);
    
    const newAgendamentoData: Omit<Agendamento, 'id' | 'createdAt'> = {
        pacienteId: data.paciente.id,
        pacienteNome: data.paciente.nome,
        start: startDate,
        title: data.title,
        status: 'agendado',
        createdBy: user.uid,
        createdAt: serverTimestamp() as any,
    };

    addDoc(agendamentosCollectionRef, newAgendamentoData)
    .then(() => {
        toast({
            title: 'Agendamento criado!',
            description: `Agendamento para ${data.paciente.nome} foi criado com sucesso.`,
        });
        form.reset();
        onOpenChange(false);
    })
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao criar agendamento',
        description: 'Você não tem permissão para executar esta ação.',
      });
      const permissionError = new FirestorePermissionError({
        path: agendamentosCollectionRef.path,
        operation: 'create',
        requestResourceData: newAgendamentoData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if(!isOpen) form.reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Criando agendamento para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="paciente"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Paciente</FormLabel>
                  <Popover open={pacientePopoverOpen} onOpenChange={setPacientePopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? field.value.nome : "Selecione um paciente"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[375px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar paciente..." />
                        <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                        <CommandGroup>
                            <CommandList>
                                {isLoadingPacientes ? <p className='p-2 text-sm text-center'>Carregando...</p> : 
                                pacientes?.map((paciente) => (
                                    <CommandItem
                                    value={paciente.nome}
                                    key={paciente.id}
                                    onSelect={() => {
                                        form.setValue("paciente", paciente);
                                        setPacientePopoverOpen(false);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        paciente.id === field.value?.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {paciente.nome}
                                    </CommandItem>
                                ))}
                           </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-4'>
                <FormField name="time" control={form.control} render={({ field }) => <FormItem className='flex-1'><FormLabel>Horário</FormLabel><FormControl><Input type='time' {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField name="title" control={form.control} render={({ field }) => <FormItem className='flex-[2]'><FormLabel>Descrição</FormLabel><FormControl><Input placeholder='Ex: Consulta de retorno' {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting} className='w-full'>
              {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Agendamento'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

