
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PoliticaDePrivacidadePage() {
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
            <h1 className="font-headline">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
              A sua privacidade é importante para nós. É política do MediCorex respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site MediCorex, e outros sites que possuímos e operamos.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
              Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </p>
            <ul>
              <li><strong>Dados de Conta e Perfil:</strong> Quando você se registra em uma conta, coletamos seu nome, endereço de e-mail e informações de contato.</li>
              <li><strong>Dados da Clínica (Tenant):</strong> Coletamos informações sobre sua clínica, incluindo nome, subdomínio escolhido e informações de assinatura.</li>
              <li><strong>Dados de Pacientes:</strong> Como parte do nosso serviço, você irá inserir informações sobre seus pacientes. Esses dados são de sua propriedade e responsabilidade. O MediCorex atua como um processador desses dados, garantindo sua segurança e confidencialidade.</li>
              <li><strong>Dados de Uso:</strong> Coletamos informações sobre como você interage com nossos serviços para nos ajudar a melhorar a plataforma.</li>
            </ul>

            <h2>2. Como Usamos Suas Informações</h2>
            <p>
              Usamos as informações que coletamos para operar, manter e fornecer a você os recursos e a funcionalidade do Serviço. Especificamente, usamos suas informações para:
            </p>
            <ul>
              <li>Criar e gerenciar sua conta e seu ambiente de clínica (tenant).</li>
              <li>Processar pagamentos e gerenciar assinaturas.</li>
              <li>Fornecer suporte ao cliente e responder às suas solicitações.</li>
              <li>Comunicar sobre atualizações, promoções e outras informações relacionadas ao serviço.</li>
              <li>Monitorar e analisar tendências de uso para melhorar a experiência do usuário.</li>
            </ul>

            <h2>3. Segurança dos Dados</h2>
            <p>
              A segurança dos seus dados é nossa prioridade máxima. Implementamos uma variedade de medidas de segurança para manter a segurança de suas informações pessoais e dos dados de seus pacientes. Os dados são criptografados em trânsito e em repouso, e o acesso é estritamente controlado por meio de regras de segurança robustas e autenticação multifator. Cada clínica opera em um ambiente de dados isolado para garantir que não haja vazamento de informações entre tenants.
            </p>
            
            <h2>4. Compartilhamento de Informações</h2>
            <p>
                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou quando estritamente necessário para a operação do serviço (por exemplo, com nosso provedor de pagamentos para processar transações).
            </p>

            <h2>5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você também pode se opor ao processamento de seus dados. Para exercer esses direitos, entre em contato conosco através dos nossos canais de suporte.
            </p>

            <h2>6. Cookies</h2>
            <p>
                Utilizamos cookies para manter sua sessão de login e para entender como você usa nosso site. Você pode configurar seu navegador para recusar cookies, mas algumas partes do nosso serviço podem não funcionar corretamente.
            </p>
            
            <h2>Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
