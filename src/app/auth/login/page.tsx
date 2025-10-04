
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
  
  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: state.error,
      });
      setIsClientSigningIn(false); // Garante que o estado de loading é resetado
    }

    if (state.success && auth) {
      setIsClientSigningIn(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const idToken = await userCredential.user.getIdToken();
          await createSessionCookie(idToken);

          toast({
            title: 'Login bem-sucedido!',
            description: 'Redirecionando...',
          });

          // Se a action retornou um slug, o usuário tem uma clínica
          if (state.tenantSlug) {
              const protocol = window.location.protocol;
              const host = window.location.host.replace(`www.`, ''); // Remove www
              const newUrl = `${protocol}//${state.tenantSlug}.${host}/dashboard`;
              window.location.href = newUrl;
          } else {
              // Se não retornou slug, é um novo usuário que precisa criar uma clínica
              router.push('/auth/create-clinic');
          }
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Erro no Login',
            description: error.message || 'Credenciais inválidas ou falha ao iniciar a sessão.',
          });
           setIsClientSigningIn(false);
        });
    }
  }, [state, auth, email, password, toast, router]);
  
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
    <Card className="bg-background/80 backdrop-blur-lg border-white/20 shadow-xl animate-fade-in-up">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Acessar sua Clínica</CardTitle>
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
