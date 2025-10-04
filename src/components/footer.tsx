
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 text-muted-foreground">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-6 gap-8 px-4 py-12 md:px-6">
        <div className="col-span-2 md:col-span-2">
          <Link href="#" className="flex items-center gap-2 mb-4" prefetch={false}>
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold font-headline text-foreground">MediCorex</span>
          </Link>
          <p className="text-sm max-w-xs">
            Otimizando a gestão de clínicas com tecnologia e inteligência para que você possa focar no cuidado.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Produto</h4>
          <ul className="space-y-1">
            <li><Link href="/#features" className="hover:text-primary transition-colors" prefetch={false}>Recursos</Link></li>
            <li><Link href="/escolha-seu-plano" className="hover:text-primary transition-colors" prefetch={false}>Preços</Link></li>
            <li><Link href="/#security" className="hover:text-primary transition-colors" prefetch={false}>Segurança</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors" prefetch={false}>FAQ</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Empresa</h4>
          <ul className="space-y-1">
            <li><Link href="/sobre" className="hover:text-primary transition-colors" prefetch={false}>Sobre Nós</Link></li>
            <li><Link href="/contato" className="hover:text-primary transition-colors" prefetch={false}>Contato</Link></li>
            <li><Link href="/carreiras" className="hover:text-primary transition-colors" prefetch={false}>Carreiras</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Legal</h4>
          <ul className="space-y-1">
            <li><Link href="/politica-de-privacidade" className="hover:text-primary transition-colors" prefetch={false}>Privacidade</Link></li>
            <li><Link href="/termos-de-servico" className="hover:text-primary transition-colors" prefetch={false}>Termos de Serviço</Link></li>
          </ul>
        </div>
         <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Social</h4>
          <div className="flex items-center gap-4">
              <Link href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
              <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
      <Separator />
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-xs">
        <p>&copy; {new Date().getFullYear()} MediCorex. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
