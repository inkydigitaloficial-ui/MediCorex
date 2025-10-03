
import { middlewareConfig } from '../config';

export class DomainUtils {
  /**
   * Extrai o subdomínio do hostname da requisição.
   * Ex: "clinica-a.medicorex.app" -> "clinica-a"
   * Ex: "app.localhost:9002" -> "app"
   */
  static extractSubdomain(hostname: string | null): string | null {
    if (!hostname) return null;

    // Em desenvolvimento, o host é algo como "localhost:9002"
    // Não há subdomínio real, então retornamos null.
    // O roteamento será feito pela estrutura de pastas _tenants/[tenantId]
    if (hostname.includes('localhost')) {
      return null;
    }
    
    // Em produção, usamos a variável de ambiente para o domínio principal
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    if (!rootDomain) {
      // Se a variável não estiver definida em prod, retorna null para evitar erros.
      return null;
    }

    const normalizedHostname = hostname.toLowerCase();

    // Se o hostname for igual ao domínio raiz, não há subdomínio.
    if (normalizedHostname === rootDomain) {
        return null;
    }
    
    // Verifica se o hostname termina com o domínio raiz (precedido por um ponto).
    if (normalizedHostname.endsWith(`.${rootDomain}`)) {
      const subdomain = normalizedHostname.substring(0, normalizedHostname.length - rootDomain.length - 1);
      
      // Valida se o subdomínio não está vazio e não contém pontos (multinível).
      if (subdomain && !subdomain.includes('.')) {
        return subdomain;
      }
    }

    return null;
  }
}
