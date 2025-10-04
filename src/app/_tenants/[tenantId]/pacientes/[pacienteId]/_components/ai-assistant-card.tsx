
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { gerarResumoPacienteAction } from '@/ai/flows/pacientes/gerarResumoPaciente';
import { User } from 'firebase/auth';

interface AIAssistantCardProps {
    tenantId: string;
    pacienteId: string;
    user: User | null;
    disabled: boolean;
}

export function AIAssistantCard({ tenantId, pacienteId, user, disabled }: AIAssistantCardProps) {
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
      const result = await gerarResumoPacienteAction({ 
        tenantId, 
        pacienteId, 
        userId: user.uid 
      });
      setSummary(result);
    } catch (err: any) {
      console.error('Erro ao gerar resumo:', err);
      setError(err.message || 'Ocorreu um erro. Verifique se existem anotações suficientes e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className='font-headline flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            Assistente IA
          </CardTitle>
          <CardDescription>
            Use a IA para analisar o histórico e gerar um resumo inteligente do prontuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-start gap-4'>
            <p className="text-sm text-muted-foreground">
              Economize tempo e obtenha insights rápidos sobre a condição do paciente.
            </p>
            <Button onClick={handleGenerateSummary} disabled={loading || disabled}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Resumo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className='border-destructive bg-destructive/10'>
          <CardHeader>
            <CardTitle className='text-destructive text-base font-semibold'>Erro ao Gerar Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resumo Gerado por IA</CardTitle>
          </CardHeader>
          <CardContent className='prose prose-sm max-w-none dark:prose-invert'>
            <p className='leading-relaxed' style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
            <p className='text-xs text-muted-foreground pt-2 border-t mt-4'>
              Este resumo foi gerado por IA e deve ser usado como apoio, não substituindo a análise profissional.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
