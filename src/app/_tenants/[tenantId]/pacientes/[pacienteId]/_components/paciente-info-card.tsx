
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paciente } from '@/types/paciente';
import { User } from 'lucide-react';

interface PacienteInfoCardProps {
  paciente: Paciente;
}

export function PacienteInfoCard({ paciente }: PacienteInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-headline flex items-center gap-2'>
          <User className='h-5 w-5 text-primary' />
          Informações do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p className='text-lg font-medium'>{paciente.nome}</p>
          <p className='text-sm text-muted-foreground'>{paciente.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
