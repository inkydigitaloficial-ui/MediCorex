
'use client';

import { useState, useMemo } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    getDay, 
    addMonths, 
    subMonths, 
    isToday, 
    isSameMonth, 
    isSameDay,
    startOfDay,
    parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTenant } from '@/components/providers/tenant-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase/hooks';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { baseConverter } from '@/lib/firestore/converters';
import { Agendamento } from '@/types/agendamento';
import { AddAgendamentoDialog } from './_components/add-agendamento-dialog';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    
    const { tenantId } = useTenant();
    const firestore = useFirestore();

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    // Busca agendamentos do mês atual
    const agendamentosQuery = useMemoFirebase(() => {
        if (!firestore || !tenantId) return null;
        return query(
            collection(firestore, `tenants/${tenantId}/agendamentos`).withConverter(baseConverter<Agendamento>()),
            where('start', '>=', firstDayOfMonth),
            where('start', '<=', lastDayOfMonth),
            orderBy('start')
        );
    }, [firestore, tenantId, firstDayOfMonth, lastDayOfMonth]);

    const { data: agendamentos, isLoading } = useCollection<Agendamento>(agendamentosQuery);

    const agendamentosPorDia = useMemo(() => {
        const grouped: { [key: string]: Agendamento[] } = {};
        agendamentos?.forEach(ag => {
            const dayKey = format(ag.start, 'yyyy-MM-dd');
            if (!grouped[dayKey]) {
                grouped[dayKey] = [];
            }
            grouped[dayKey].push(ag);
        });
        return grouped;
    }, [agendamentos]);

    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    const startingDayIndex = getDay(firstDayOfMonth);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setDialogOpen(true);
    };

    return (
        <>
            {tenantId && selectedDate && (
                 <AddAgendamentoDialog
                    tenantId={tenantId}
                    open={isDialogOpen}
                    onOpenChange={setDialogOpen}
                    selectedDate={selectedDate}
                />
            )}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">
                        Agenda
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mês anterior">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={goToToday} className='min-w-[100px]'>
                            Hoje
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Próximo mês">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col flex-1 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className='p-4 border-b flex justify-between items-center'>
                        <h2 className="text-xl font-semibold text-center font-headline capitalize flex-1">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <Button onClick={() => handleDayClick(new Date())} size='sm'>
                            <PlusCircle className='mr-2 h-4 w-4' />
                            Agendar
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 flex-1">
                        {weekDays.map(day => (
                            <div key={day} className="text-center font-medium text-muted-foreground p-2 border-b border-r text-sm">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: startingDayIndex }).map((_, index) => (
                            <div key={`empty-${index}`} className="border-r border-b bg-muted/30"></div>
                        ))}

                        {daysInMonth.map(day => {
                             const dayKey = format(day, 'yyyy-MM-dd');
                             const agendamentosDoDia = agendamentosPorDia[dayKey] || [];

                            return (
                                <div 
                                    key={day.toString()} 
                                    className={cn(
                                        "relative p-2 border-r border-b flex flex-col min-h-[120px] group",
                                        !isSameMonth(day, currentDate) && "bg-muted/30"
                                    )}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <button className={cn(
                                        "h-7 w-7 flex items-center justify-center rounded-full text-sm self-start mb-2",
                                        isToday(day) && "bg-primary text-primary-foreground font-bold"
                                    )}>
                                        {format(day, 'd')}
                                    </button>
                                    <div className="flex-1 space-y-1 overflow-y-auto">
                                        {agendamentosDoDia.map(ag => (
                                            <div key={ag.id} className='bg-primary/10 text-primary-foreground p-1 rounded-md text-[10px] leading-tight'>
                                                <p className='font-bold text-primary'>{format(ag.start, 'HH:mm')}</p>
                                                <p className='text-primary/80 truncate'>{ag.pacienteNome}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        className='absolute top-1 right-1 h-6 w-6 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                                        onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                                    >
                                        <PlusCircle className='h-4 w-4'/>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}
