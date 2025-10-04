
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Paciente } from '@/types/paciente';
import { Contact, FileText } from 'lucide-react';

interface PacienteInfoCardProps {
  paciente: Paciente;
}

export function PacienteInfoCard({ paciente }: PacienteInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-headline flex items-center gap-2'>
          <Contact className='h-5 w-5 text-primary' />
          Informações do Paciente
        </CardTitle>
        <CardDescription>Dados cadastrais e de contato.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium text-right">{paciente.nome}</span>
        </div>
         <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium text-right">{paciente.email}</span>
        </div>
        {paciente.cpf && (
             <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CPF:</span>
                <span className="font-medium text-right">{paciente.cpf}</span>
            </div>
        )}
        {paciente.telefone && (
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-medium text-right">{paciente.telefone}</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
