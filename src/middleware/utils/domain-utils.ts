
import { middlewareConfig } from '../config';

export class DomainUtils {
  /**
   * Extrai o subdomínio do hostname da requisição.
   * Ex: "clinica-a.medicorex.app" -> "clinica-a"
   * Ex: "app.localhost:9002" -> "app"
   */
  static extractSubdomain(hostname: string | null): string | null {
    if (!hostname) return null;

    const normalizedHostname = hostname.toLowerCase();

    // Em desenvolvimento, permite que `sub.localhost:port` funcione como um subdomínio.
    if (normalizedHostname.includes('localhost')) {
      const parts = normalizedHostname.split('.');
      // Se tivermos algo como "tenant.localhost:9002", o 'tenant' será o subdomínio.
      if (parts.length > 1 && parts[0] !== 'localhost') {
        return parts[0];
      }
      return null;
    }
    
    const rootDomain = middlewareConfig.rootDomain;

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
