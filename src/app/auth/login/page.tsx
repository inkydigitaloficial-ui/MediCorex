
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
import { useAuth } from '@/lib/firebase/use-auth';
import { createSessionCookie } from '../session/actions';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className='animate-spin' /> Verificando...</> : 'Entrar'}
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
            const protocol = window.location.protocol;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host;
            
            window.location.href = `${protocol}//${state.tenantSlug}.${rootDomain}`;
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm space-y-6">
            <div className="flex justify-center">
                <Link href="/" className="flex items-center gap-2 text-primary">
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-semibold font-headline">MediCorex</span>
                </Link>
            </div>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-headline">Acessar sua Clínica</CardTitle>
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
                    <Link href="/auth/signup" className="underline font-medium hover:text-primary">
                      Comece seu teste gratuito
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
        </div>
    </div>
  );
}
