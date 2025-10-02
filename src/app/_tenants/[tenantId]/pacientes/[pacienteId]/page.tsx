
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, User } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase/hooks';
import { gerarResumoPaciente } from '@/flows/pacientes/gerarResumoPaciente';
import { doc } from 'firebase/firestore';
import { Paciente } from '@/types/paciente';
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

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!user) {
        setError('Você precisa estar autenticado para executar esta ação.');
        return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await gerarResumoPaciente({ 
        tenantId: params.tenantId, 
        pacienteId: params.pacienteId, 
        userId: user.uid 
      });
      setSummary(result);
    } catch (err: any) {
      console.error('Erro ao gerar resumo:', err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">
                Prontuário do Paciente
            </h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className='font-headline flex items-center gap-2'>
                    <User className='h-5 w-5 text-primary' />
                    Informações do Paciente
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isPacienteLoading ? (
                    <div className='space-y-2'>
                        <Skeleton className='h-5 w-48' />
                        <Skeleton className='h-4 w-64' />
                    </div>
                ) : paciente ? (
                    <div>
                        <p className='text-lg font-medium'>{paciente.nome}</p>
                        <p className='text-sm text-muted-foreground'>{paciente.email}</p>
                    </div>
                ) : (
                    <p className='text-sm text-muted-foreground'>Paciente não encontrado.</p>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className='font-headline'>Assistente IA</CardTitle>
                <CardDescription>
                    Gere um resumo inteligente do histórico do paciente para otimizar seu tempo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col items-start gap-4'>
                    <p className="text-sm text-muted-foreground">
                        Clique no botão abaixo para que a IA analise o prontuário e gere um resumo conciso.
                    </p>
                    <Button 
                        onClick={handleGenerateSummary}
                        disabled={loading || isUserLoading || isPacienteLoading || !paciente}
                    >
                        {loading ? (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                Gerando Resumo...
                            </>
                        ) : (
                             <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Gerar Resumo com IA
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>

      {error && (
        <Card className='border-destructive'>
            <CardHeader>
                <CardTitle className='text-destructive'>Erro na Geração</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-sm text-destructive'>{error}</p>
            </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Gerado por IA</CardTitle>
          </CardHeader>
          <CardContent className='prose prose-sm max-w-none dark:prose-invert'>
            <p className='leading-relaxed'>{summary}</p>
            <p className='text-xs text-muted-foreground pt-2 border-t mt-4'>Este resumo foi gerado por IA e deve ser usado como apoio, não substituindo a análise profissional.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
