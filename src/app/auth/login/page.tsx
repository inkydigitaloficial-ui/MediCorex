
'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '../actions';
import { useAuth } from '@/firebase/hooks';
import { createSessionCookie } from '../session/actions';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className='animate-spin' /> Verificando...</> : 'Entrar'}
    </Button>
  );
}

function LoginFormComponent() {
  const [state, formAction] = useActionState(loginAction, { error: null, success: false, tenantSlug: null });
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClientSigningIn, setIsClientSigningIn] = useState(false);
  const [rootDomain, setRootDomain] = useState('');

  useEffect(() => {
    // Define o rootDomain a partir do window.location.host quando o componente é montado no cliente
    setRootDomain(window.location.host);
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: state.error,
      });
    }

    if (state.success && state.tenantSlug && auth && rootDomain) {
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
            
            // Em dev, redirecionamos para a página que simula o tenant
            // Em prod, para o subdomínio real
            if (process.env.NODE_ENV === 'development') {
                router.push(`/_tenants/${state.tenantSlug}/dashboard`);
            } else {
                window.location.href = `${protocol}//${state.tenantSlug}.${rootDomain}`;
            }

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
  }, [state, auth, email, password, toast, rootDomain, router]);
  
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
    <Card className="bg-background/80 backdrop-blur-lg border-white/20 shadow-xl">
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
              className="bg-background/70"
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
              className="bg-background/70"
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
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginFormComponent />
    </Suspense>
  );
}
