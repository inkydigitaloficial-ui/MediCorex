
import { middlewareConfig } from '../config';

export class DomainUtils {
  /**
   * Extrai o subdomínio do hostname da requisição.
   * Ex: "clinica-a.medicorex.app" -> "clinica-a"
   * Ex: "app.localhost:9002" -> "app"
   * Ex: "app.1234.cloudworkstations.dev" -> "app"
   */
  static extractSubdomain(hostname: string | null): string | null {
    if (!hostname) return null;

    const normalizedHostname = hostname.toLowerCase();

    // Em desenvolvimento, lida com hosts complexos como os do Cloud Workstation
    if (normalizedHostname.includes('localhost') || normalizedHostname.includes('cloudworkstations.dev')) {
      const parts = normalizedHostname.split('.');
      if (parts.length > 0 && parts[0] !== 'localhost' && !parts[0].endsWith('cloudworkstations')) {
        // Retorna a primeira parte, que deve ser o slug do tenant
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

  /**
   * Obtém o domínio raiz a partir do hostname.
   * Em dev (ex: 'tenant.1234.cloudworkstations.dev'), retorna '1234.cloudworkstations.dev'.
   * Em prod (ex: 'tenant.medicorex.app'), retorna 'medicorex.app'.
   */
  static getRootDomain(hostname: string): string {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      // Para ambientes de dev como 'tenant-slug.port-forward.cluster-id.cloudworkstations.dev'
      // ou 'tenant.localhost:3000', pegamos tudo após o primeiro ponto.
      if (hostname.includes('localhost') || hostname.includes('cloudworkstations.dev')) {
        return parts.slice(1).join('.');
      }
    }
    // Para produção, usamos o domínio definido na config.
    return middlewareConfig.rootDomain;
  }
}
