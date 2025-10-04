
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/hooks';
import { useToast } from '@/hooks/use-toast';
import { createClinicAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Substitui espaços por -
    .replace(/[^\w\-]+/g, '')       // Remove todos os caracteres não-alfanuméricos exceto -
    .replace(/\-\-+/g, '-');        // Substitui múltiplos - por um único -
}

export default function CreateClinicPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [clinicName, setClinicName] = useState('');
  const [clinicSlug, setClinicSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rootDomain, setRootDomain] = useState('');

  useEffect(() => {
    // Define o rootDomain a partir do window.location.host quando o componente é montado no cliente
    setRootDomain(window.location.host);
  }, []);

  useEffect(() => {
    // Sugere um slug baseado no nome da clínica
    setClinicSlug(slugify(clinicName));
  }, [clinicName]);

  // Se o usuário não estiver logado, redireciona para o login
  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({ title: 'Sessão expirada', description: 'Por favor, faça login novamente.', variant: 'destructive'});
      router.replace('/auth/login');
    }
  }, [user, isUserLoading, router, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ title: 'Usuário não encontrado', description: 'Sua sessão pode ter expirado.', variant: 'destructive'});
        return;
    }
    
    setLoading(true);
    setError(null);

    const result = await createClinicAction(user.uid, clinicName, clinicSlug);

    if (result.success) {
        toast({ title: 'Clínica criada com sucesso!', description: 'Redirecionando para seu painel...' });
        
        const protocol = window.location.protocol;
        const newUrl = `${protocol}//${clinicSlug}.${rootDomain}/dashboard`;
        window.location.href = newUrl;

    } else {
        // Exibe o erro específico retornado pela action
        setError(result.error);
        toast({ title: 'Erro ao criar clínica', description: result.error, variant: 'destructive'});
        setLoading(false);
    }
  };
  
  if (isUserLoading || !user || !rootDomain) {
      return (
          <div className='flex h-screen items-center justify-center bg-transparent'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
      )
  }

  return (
    <Card className="bg-background/80 backdrop-blur-lg border-white/20 shadow-xl">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Configure sua Clínica</CardTitle>
            <CardDescription>
                Defina o nome e o endereço exclusivo da sua clínica na web. (Etapa 2 de 2)
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="clinicName">Nome da Clínica</Label>
                    <Input 
                        id="clinicName" 
                        name="clinicName" 
                        placeholder="Ex: Clínica Dr. João da Silva" 
                        required 
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="bg-background/70"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinicSlug">Endereço da Clínica</Label>
                    <div className="flex items-center">
                        <Input 
                            id="clinicSlug" 
                            name="clinicSlug" 
                            required
                            value={clinicSlug}
                            onChange={(e) => setClinicSlug(slugify(e.target.value))}
                            className="rounded-r-none focus:!ring-offset-0 focus:z-10 relative bg-background/70"
                        />
                        <span className="inline-flex items-center px-3 h-10 text-sm bg-muted border border-l-0 rounded-r-md text-muted-foreground">
                            .{rootDomain}
                        </span>
                    </div>
                    {/* Exibe a mensagem de erro específica retornada pela action */}
                    {error && <p className="text-sm text-destructive pt-2">{error}</p>}
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={loading || !clinicName || !clinicSlug}>
                    {loading ? <><Loader2 className="animate-spin" /> Finalizando...</> : 'Concluir e Acessar minha Clínica'}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}
