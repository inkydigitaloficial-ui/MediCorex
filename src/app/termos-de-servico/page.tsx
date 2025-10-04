
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermosDeServicoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">MediCorex</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/#features" prefetch={false}>
              Recursos
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/escolha-seu-plano" prefetch={false}>
              Preços
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login" prefetch={false}>
              Entrar
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-16 px-4 md:px-6">
          <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
            <h1 className="font-headline">Termos de Serviço</h1>
            <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
              Bem-vindo ao MediCorex. Ao usar nossos serviços, você concorda com estes termos. Por favor, leia-os com atenção.
            </p>

            <h2>1. Uso dos Nossos Serviços</h2>
            <p>
              Você deve seguir todas as políticas disponibilizadas a você dentro dos Serviços. Não faça uso indevido de nossos Serviços. Por exemplo, não interfira com nossos Serviços nem tente acessá-los por um método diferente da interface e das instruções que fornecemos.
            </p>
            <ul>
              <li><strong>Sua Conta MediCorex:</strong> Você pode precisar de uma Conta MediCorex para usar alguns de nossos Serviços. Você mesmo pode criar sua Conta MediCorex. Para proteger sua conta, mantenha sua senha em sigilo.</li>
              <li><strong>Uso Aceitável:</strong> Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes termos. Você é responsável por toda a sua atividade em conexão com os Serviços.</li>
            </ul>

            <h2>2. Privacidade e Proteção de Dados</h2>
            <p>
              As Políticas de Privacidade do MediCorex explicam como tratamos seus dados pessoais e protegemos sua privacidade quando você usa nossos Serviços. Ao usar nossos Serviços, você concorda que o MediCorex pode usar esses dados de acordo com nossas políticas de privacidade. Você, como controlador dos dados de seus pacientes, é responsável por obter o consentimento apropriado e cumprir todas as leis de proteção de dados aplicáveis, como a LGPD.
            </p>

            <h2>3. Conteúdo em Nossos Serviços</h2>
            <p>
              Nossos Serviços permitem que você faça upload, submeta, armazene, envie ou receba conteúdo. Você mantém a propriedade de quaisquer direitos de propriedade intelectual que detenha sobre esse conteúdo. Em suma, o que pertence a você continua sendo seu. O MediCorex não reivindica propriedade sobre os dados de seus pacientes.
            </p>

            <h2>4. Assinatura e Pagamentos</h2>
            <p>
                O acesso a determinados recursos do Serviço pode exigir o pagamento de taxas de assinatura. Todas as taxas são cobradas antecipadamente e não são reembolsáveis. Se seu período de teste terminar, seu acesso será limitado até que uma assinatura seja ativada.
            </p>

            <h2>5. Sobre Software em nossos Serviços</h2>
            <p>
              O MediCorex concede a você uma licença pessoal, mundial, isenta de royalties, não atribuível e não exclusiva para usar o software fornecido a você pelo MediCorex como parte dos Serviços. Esta licença tem como único objetivo permitir que você use e aproveite os benefícios dos Serviços como fornecidos pelo MediCorex, da forma permitida por estes termos.
            </p>
            
            <h2>6. Modificação e Rescisão de Nossos Serviços</h2>
            <p>
              Estamos constantemente alterando e melhorando nossos Serviços. Podemos adicionar ou remover funcionalidades ou recursos, e podemos suspender ou encerrar um Serviço por completo. Você pode parar de usar nossos Serviços a qualquer momento, embora lamentemos vê-lo partir.
            </p>

            <h2>Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
