
'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase/hooks';
import { doc } from 'firebase/firestore';
import { Paciente } from '@/types/paciente';
import { PacienteInfoCard } from './_components/paciente-info-card';
import { AIAssistantCard } from './_components/ai-assistant-card';
import { useUser } from '@/firebase/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export default function PacienteDetailPage({ 
  params 
}: { 
  params: { tenantId: string; pacienteId: string } 
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const pacienteDocRef = useMemoFirebase(() => {
    if (!firestore || !params.tenantId || !params.pacienteId) return null;
    return doc(firestore, `tenants/${params.tenantId}/pacientes/${params.pacienteId}`);
  }, [firestore, params.tenantId, params.pacienteId]);

  const { data: paciente, isLoading: isPacienteLoading } = useDoc<Paciente>(pacienteDocRef);

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
        </div>
      ) : paciente ? (
        <>
          <PacienteInfoCard paciente={paciente} />
          <AIAssistantCard 
            tenantId={params.tenantId}
            pacienteId={params.pacienteId}
            user={user}
            disabled={!paciente}
          />
        </>
      ) : (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-10">
            <p className="text-muted-foreground">Paciente não encontrado.</p>
        </div>
      )}
    </div>
  );
}
