
'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useActionState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '../actions';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verificando...' : 'Entrar'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: null, success: false, tenantSlug: null });
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClientSigningIn, setIsClientSigningIn] = useState(false);

  useEffect(() => {
    // Se a ação do servidor falhou, exibe o erro específico que ela retornou.
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: state.error,
      });
    }

    // Se a ação do servidor teve sucesso, então prosseguimos para o login no cliente.
    if (state.success && state.tenantSlug && auth) {
      setIsClientSigningIn(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast({
            title: 'Login bem-sucedido!',
            description: 'Redirecionando para seu painel...',
          });
          const protocol = window.location.protocol;
          const host = window.location.host.includes('localhost')
            ? 'localhost:9002' // Garante a porta correta em dev
            : window.location.host;
          
          const rootDomain = host.split('.').slice(-2).join('.');
          
          window.location.href = `${protocol}//${state.tenantSlug}.${rootDomain}`;
        })
        .catch(() => {
          // Este erro só deve acontecer se a senha estiver errada, já que o email foi validado no servidor.
          toast({
            variant: 'destructive',
            title: 'Erro no Login',
            description: 'Credenciais inválidas. Verifique seu email e senha.',
          });
        })
        .finally(() => {
            setIsClientSigningIn(false);
        });
    }
  }, [state, auth, email, password, toast]);
  
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      toast({
        title: 'Cadastro realizado!',
        description: 'Sua clínica está sendo criada. Aguarde um instante e faça login.',
        duration: 5000,
      });
    }
  }, [searchParams, toast]);

  const { pending } = useFormStatus();
  const isDisabled = pending || isClientSigningIn;

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Acesse sua conta para gerenciar sua clínica.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isDisabled}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-xs text-muted-foreground text-center">
            Não tem uma conta?{' '}
            <Link href="/auth/signup" className="underline hover:text-primary">
              Cadastre-se e crie sua clínica
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
