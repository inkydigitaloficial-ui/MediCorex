'use client';

import { useState } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/firebase'; // Hook para obter o usuário autenticado

// A Server Action que irá chamar o fluxo Genkit
async function generateSummaryAction(tenantId: string, pacienteId: string, userId: string): Promise<string> {
    'use server';
    // Em um cenário real, você importaria e chamaria o fluxo Genkit aqui.
    // Por enquanto, vamos simular a chamada e o retorno.
    // const { gerarResumoPaciente } = await import('@/flows/pacientes/gerarResumoPaciente');
    // return await gerarResumoPaciente({ tenantId, pacienteId, userId });
    
    // Simulação de retorno para fins de UI
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Resumo do paciente ${pacienteId} para a clínica ${tenantId}, gerado pelo usuário ${userId}. O paciente apresenta um histórico de consultas regulares para acompanhamento de condição crônica. Última consulta há 2 meses mostrou boa adesão ao tratamento. Recomenda-se agendar retorno para avaliação.`;
}


export default function PacienteDetailPage({ 
  params 
}: { 
  params: { tenantId: string; pacienteId: string } 
}) {
  const { tenant } = useTenant();
  const { user } = useUser(); // Obter o usuário do Firebase Auth
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
      const result = await generateSummaryAction(params.tenantId, params.pacienteId, user.uid);
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
                Prontuário do Paciente: {params.pacienteId}
            </h1>
        </div>
        
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
                        disabled={loading}
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

      {loading && (
         <Card>
            <CardHeader>
                <CardTitle>Resumo em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-sm text-muted-foreground'>Aguarde, a IA está processando os dados...</p>
            </CardContent>
        </Card>
      )}

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
            <CardTitle>Resumo Gerado</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm leading-relaxed'>{summary}</p>
            <p className='text-xs text-muted-foreground pt-2 border-t'>Este resumo foi gerado por IA e deve ser usado como apoio, não substituindo a análise profissional.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
