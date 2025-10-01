'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Erro de Configuração',
            description: 'O serviço de autenticação não está disponível. Tente novamente mais tarde.',
        });
        return;
    }

    setLoading(true);

    try {
      // 1. Cria o usuário
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Faz o login automático com as mesmas credenciais
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Estamos preparando sua clínica. Você será redirecionado em instantes.',
      });

      // 3. Redireciona para a página de setup que vai aguardar a criação do tenant
      router.push('/auth/setup-account');

    } catch (error: any) {
      let description = 'Ocorreu um erro desconhecido. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este endereço de e-mail já está sendo usado por outra conta.';
      } else if (error.code === 'auth/weak-password') {
        description = 'A senha é muito fraca. Tente uma senha mais forte com pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        description = 'O endereço de e-mail fornecido não é válido.';
      }
      console.error('Erro no cadastro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: description,
      });
       setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Crie sua Conta na MediCorex</CardTitle>
        <CardDescription>
          Comece agora com 7 dias de teste gratuito do nosso plano Premium.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignUp}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome Completo</Label>
            <Input id="name" name="name" type="text" placeholder="Nome do responsável" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Seu Melhor Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (Opcional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Crie uma Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando sua clínica...' : 'Criar Conta e Iniciar Teste'}
          </Button>
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
