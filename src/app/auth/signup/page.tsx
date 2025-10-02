
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase/use-auth';
import { db } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';


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
    const phone = formData.get('phone') as string;

    if (!auth || !db) {
      toast({ title: 'Erro de inicialização', description: 'Serviços de autenticação ou banco de dados não estão disponíveis.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      // 1. Criar o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Atualizar o perfil do Auth com o nome de exibição
      await updateProfile(user, { displayName: name });
      
      // 3. Salvar o perfil completo no Firestore, incluindo o telefone
      const userProfileRef = doc(db, 'users', user.uid);
      await setDoc(userProfileRef, {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone || null, // Salva o telefone ou null se vazio
        createdAt: serverTimestamp(),
      });
      
      toast({ title: 'Conta criada!', description: 'Agora, vamos criar sua clínica.' });
      
      // 4. Redirecionar para a segunda etapa do cadastro
      router.push('/auth/create-clinic');

    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      let friendlyMessage = 'Ocorreu um erro desconhecido.';
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Este endereço de email já está em uso por outra conta.';
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = 'A senha é muito fraca. Tente uma com pelo menos 6 caracteres.';
      }
      toast({ title: 'Erro no cadastro', description: friendlyMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
            <div className="flex justify-center">
                <Link href="/" className="flex items-center gap-2 text-primary">
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-semibold font-headline">MediCorex</span>
                </Link>
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Comece seu Teste Gratuito</CardTitle>
                    <CardDescription>Crie sua conta. Rápido, fácil e sem compromisso.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" name="name" placeholder="Seu nome" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone (Opcional)</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" />
                    </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin"/> Criando conta...</> : 'Continuar para Etapa 2'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Já tem uma conta?{' '}
                        <Link href="/auth/login" className="underline font-medium hover:text-primary">
                        Faça login
                        </Link>
                    </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
