
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addDoc, collection, serverTimestamp, DocumentReference } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/hooks';
import { FilePlus2, Loader2 } from 'lucide-react';
import { baseConverter } from '@/lib/firestore/converters';
import { Consulta } from '@/types/consulta';

const consultaSchema = z.object({
    summary: z.string().min(10, { message: 'A anotação deve ter pelo menos 10 caracteres.' }),
});

type ConsultaFormData = z.infer<typeof consultaSchema>;

interface AddConsultaFormProps {
    pacienteRef: DocumentReference;
}

export function AddConsultaForm({ pacienteRef }: AddConsultaFormProps) {
    const { toast } = useToast();
    const { user } = useUser();

    const form = useForm<ConsultaFormData>({
        resolver: zodResolver(consultaSchema),
        defaultValues: {
            summary: '',
        },
    });

    const onSubmit = async (data: ConsultaFormData) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar autenticado.' });
            return;
        }

        const consultasCollectionRef = collection(pacienteRef, 'consultas').withConverter(baseConverter<Consulta>());
        
        try {
            await addDoc(consultasCollectionRef, {
                summary: data.summary,
                createdBy: user.uid,
                // O `createdAt` será adicionado pelo `baseConverter`
            });

            toast({
                title: 'Sucesso!',
                description: 'Nova anotação de consulta adicionada ao prontuário.',
            });
            form.reset();
        } catch (error) {
            console.error("Erro ao adicionar consulta:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: 'Não foi possível adicionar a anotação. Verifique suas permissões e tente novamente.',
            });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle className='font-headline flex items-center gap-2'>
                    <FilePlus2 className='h-5 w-5 text-primary' />
                    Adicionar Anotação de Consulta
                </CardTitle>
                <CardDescription>Registre informações sobre o atendimento, evolução ou qualquer dado relevante.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição da Consulta</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva aqui os detalhes da consulta, sintomas, diagnóstico, tratamento prescrito, etc."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Anotação'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
