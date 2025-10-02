'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase/use-auth';
import { createSessionCookie } from '../session/actions';

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!auth) {
      toast({ title: 'Erro de autenticação', description: 'O serviço de autenticação não está disponível.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      // 1. Criar o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Atualizar o perfil com o nome de exibição
      await updateProfile(user, { displayName: name });
      toast({ title: 'Usuário criado!', description: 'Agora vamos configurar sua sessão...' });

      // 3. Obter o token de ID do Firebase
      const idToken = await user.getIdToken(true); // Forçar atualização para garantir que o nome está no token

      // 4. Enviar o token para a Server Action para criar o cookie de sessão
      const sessionResult = await createSessionCookie(idToken);

      if (sessionResult.status === 'success') {
        // 5. Redirecionar para a página de setup da conta
        toast({ title: 'Sessão iniciada!', description: 'Finalizando a configuração da sua clínica...' });
        router.push('/auth/setup-account');
      } else {
        throw new Error(sessionResult.message || 'Falha ao criar a sessão de usuário.');
      }

    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Preencha seus dados para criar uma nova conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Seu nome completo" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
