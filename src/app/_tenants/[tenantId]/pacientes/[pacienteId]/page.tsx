
'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase/hooks';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Paciente } from '@/types/paciente';
import { PacienteInfoCard } from './_components/paciente-info-card';
import { AIAssistantCard } from './_components/ai-assistant-card';
import { useUser } from '@/firebase/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AddConsultaForm } from './_components/add-consulta-form';
import { ConsultasTimeline } from './_components/consultas-timeline';
import { Consulta } from '@/types/consulta';

export default function PacienteDetailPage({ 
  params 
}: { 
  params: { tenantId: string; pacienteId: string } 
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Referência para o documento do paciente
  const pacienteDocRef = useMemoFirebase(() => {
    if (!firestore || !params.tenantId || !params.pacienteId) return null;
    return doc(firestore, `tenants/${params.tenantId}/pacientes/${params.pacienteId}`);
  }, [firestore, params.tenantId, params.pacienteId]);

  // Query para a subcoleção de consultas
  const consultasQuery = useMemoFirebase(() => {
    if (!pacienteDocRef) return null;
    return query(collection(pacienteDocRef, 'consultas'), orderBy('createdAt', 'desc'));
  }, [pacienteDocRef]);

  const { data: paciente, isLoading: isPacienteLoading } = useDoc<Paciente>(pacienteDocRef);
  const { data: consultas, isLoading: isConsultasLoading } = useCollection<Consulta>(consultasQuery);

  const isLoading = isUserLoading || isPacienteLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Prontuário do Paciente
        </h1>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-64 w-full' />
        </div>
      ) : paciente ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <AddConsultaForm pacienteRef={pacienteDocRef} />
            <ConsultasTimeline consultas={consultas} isLoading={isConsultasLoading} />
          </div>
          <div className="space-y-6">
            <PacienteInfoCard paciente={paciente} />
            <AIAssistantCard 
              tenantId={params.tenantId}
              pacienteId={params.pacienteId}
              user={user}
              disabled={!paciente}
            />
          </div>
        </div>
      ) : (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-10">
            <p className="text-muted-foreground">Paciente não encontrado.</p>
        </div>
      )}
    </div>
  );
}
