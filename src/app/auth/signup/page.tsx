
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signupAction } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Criando sua clínica...' : 'Criar Conta e Iniciar Teste'}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, { error: null, success: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Crie sua Conta na MediCorex</CardTitle>
        <CardDescription>
          Comece agora com 7 dias de teste gratuito do nosso plano Premium.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome Completo</Label>
            <Input id="name" name="name" type="text" placeholder="Nome do responsável" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Seu Melhor Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (Opcional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="(99) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Crie uma Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-xs text-muted-foreground text-center">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="underline hover:text-primary">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
