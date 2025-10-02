
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
import { loginAction } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase/hooks';
import { createSessionCookie } from '@/app/auth/session/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verificando...' : 'Entrar'}
    </Button>
  );
}

export default function TenantLoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: null, success: false, tenantSlug: null });
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClientSigningIn, setIsClientSigningIn] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: state.error,
      });
    }

    if (state.success && state.tenantSlug && auth) {
      setIsClientSigningIn(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const idToken = await userCredential.user.getIdToken();
          const sessionResult = await createSessionCookie(idToken);

          if (sessionResult.status === 'success') {
            toast({
              title: 'Login bem-sucedido!',
              description: 'Redirecionando para seu painel...',
            });
            // Para login dentro de um tenant, redireciona para o dashboard do tenant
            window.location.href = '/dashboard';
          } else {
            throw new Error(sessionResult.message);
          }
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Erro no Login',
            description: error.message || 'Credenciais inválidas ou falha ao iniciar a sessão.',
          });
        })
        .finally(() => {
            setIsClientSigningIn(false);
        });
    }
  }, [state, auth, email, password, toast]);
  
  const { pending } = useFormStatus();
  const isDisabled = pending || isClientSigningIn;

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Acessar Clínica</CardTitle>
        <CardDescription>
          Faça login para continuar para o seu painel.
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
        </CardFooter>
      </form>
    </Card>
  );
}
