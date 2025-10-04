
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Consulta } from '@/types/consulta';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History } from 'lucide-react';

interface ConsultasTimelineProps {
    consultas: Consulta[] | null;
    isLoading: boolean;
}

function TimelineItem({ consulta }: { consulta: Consulta }) {
    const formattedDate = consulta.createdAt 
        ? format(consulta.createdAt, "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })
        : 'Data indisponível';

    return (
        <div className="relative pl-8 sm:pl-10 py-4 group">
            {/* Dot */}
            <div className="flex items-center absolute left-0 top-6">
                <div className="w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-background"></div>
            </div>
            {/* Line */}
            <div className="absolute left-[4.5px] top-7 h-full w-px bg-border group-last:h-0"></div>
            
            <p className="text-sm font-medium text-muted-foreground">{formattedDate}</p>
            <div className="prose prose-sm max-w-none dark:prose-invert mt-2">
                <p className="leading-relaxed whitespace-pre-wrap">{consulta.summary}</p>
            </div>
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-3 w-3 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}


export function ConsultasTimeline({ consultas, isLoading }: ConsultasTimelineProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='font-headline flex items-center gap-2'>
                    <History className='h-5 w-5 text-primary' />
                    Histórico de Consultas
                </CardTitle>
                <CardDescription>
                    Linha do tempo com todas as anotações e evoluções do paciente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TimelineSkeleton />
                ) : consultas && consultas.length > 0 ? (
                    <div className="relative">
                        {consultas.map((consulta) => (
                            <TimelineItem key={consulta.id} consulta={consulta} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Nenhuma anotação de consulta registrada.</p>
                        <p className="text-sm text-muted-foreground mt-1">Use o formulário acima para adicionar a primeira.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
