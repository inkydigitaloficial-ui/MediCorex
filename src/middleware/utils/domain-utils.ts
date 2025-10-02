import { middlewareConfig } from '../config';

export class DomainUtils {
  /**
   * Extrai o subdomínio do hostname da requisição.
   * Ex: "clinica-a.medicorex.app" -> "clinica-a"
   * Ex: "app.localhost:3000" -> "app"
   */
  static extractSubdomain(hostname: string | null): string | null {
    if (!hostname) return null;

    const rootDomain = middlewareConfig.rootDomain;
    const normalizedHostname = hostname.toLowerCase();

    // Se o hostname for igual ao domínio raiz (com ou sem porta), não há subdomínio.
    if (normalizedHostname === rootDomain || normalizedHostname.startsWith(rootDomain + ':')) {
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
    
    // Caso especial para desenvolvimento local (ex: clinica-a.localhost:3000)
    if (process.env.NODE_ENV === 'development' && normalizedHostname.endsWith('.localhost:3000')) {
        const subdomain = normalizedHostname.replace('.localhost:3000', '');
        if (subdomain && subdomain !== 'www') {
            return subdomain;
        }
    }


    return null;
  }
}
