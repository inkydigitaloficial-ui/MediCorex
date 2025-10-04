
'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Constante para os dias da semana
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    // Gera todos os dias no intervalo do mês
    const daysInMonth = eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
    });

    // Pega o dia da semana do primeiro dia do mês (0 para Domingo, 1 para Segunda, etc.)
    const startingDayIndex = getDay(firstDayOfMonth);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    return (
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
                {/* Cabeçalho do Calendário */}
                <div className='p-4 border-b'>
                     <h2 className="text-xl font-semibold text-center font-headline capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                </div>

                {/* Grid do Calendário */}
                <div className="grid grid-cols-7 flex-1">
                    {/* Dias da semana */}
                    {weekDays.map(day => (
                        <div key={day} className="text-center font-medium text-muted-foreground p-2 border-b border-r text-sm">
                            {day}
                        </div>
                    ))}

                    {/* Espaços em branco para o início do mês */}
                    {Array.from({ length: startingDayIndex }).map((_, index) => (
                         <div key={`empty-${index}`} className="border-r border-b bg-muted/30"></div>
                    ))}

                    {/* Dias do mês */}
                    {daysInMonth.map(day => (
                        <div key={day.toString()} className={cn(
                            "relative p-2 border-r border-b flex flex-col min-h-[120px]",
                            !isSameMonth(day, currentDate) && "bg-muted/30"
                        )}>
                            <span className={cn(
                                "h-7 w-7 flex items-center justify-center rounded-full text-sm",
                                isToday(day) && "bg-primary text-primary-foreground font-bold"
                            )}>
                                {format(day, 'd')}
                            </span>
                             <div className="flex-1 mt-2 text-xs text-muted-foreground">
                                {/* Futuro espaço para eventos */}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6 mt-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold tracking-tight">Funcionalidade de Agendamento em Breve</h2>
                    <p className="text-muted-foreground max-w-md">
                        A interatividade completa, incluindo adição e edição de eventos, estará disponível nas próximas atualizações.
                    </p>
                </div>
            </div>
        </main>
    );
}
