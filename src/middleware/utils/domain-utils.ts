import { middlewareConfig } from '../config';

export class DomainUtils {
  static extractSubdomain(hostname: string): string | null {
    const config = middlewareConfig;
    const normalizedHostname = hostname.toLowerCase().trim();
    const hostnameWithoutPort = normalizedHostname.replace(/:\d+$/, '');
    
    // Desenvolvimento: clinic.localhost:3000 → clinic
    if (config.features.developmentMode && hostnameWithoutPort.includes('.localhost')) {
      const subdomain = hostnameWithoutPort.replace('.localhost', '');
      return this.validateSubdomain(subdomain) ? subdomain : null;
    }
    
    // Produção: clinic.medicorex.app → clinic
    const rootDomain = config.domains.production.replace(/:\d+$/, '');
    if (hostnameWithoutPort.endsWith(`.${rootDomain}`)) {
      const subdomain = hostnameWithoutPort.slice(0, -(rootDomain.length + 1));
      return this.validateSubdomain(subdomain) ? subdomain : null;
    }
    
    return null;
  }
  
  private static validateSubdomain(subdomain: string): boolean {
    const config = middlewareConfig;
    
    if (!subdomain || subdomain.length > 63) return false;
    
    // Validação DNS RFC 1123
    const dnsPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!dnsPattern.test(subdomain)) return false;
    
    // Verifica subdomínios reservados
    if (config.security.reservedSubdomains.has(subdomain)) return false;
    
    return true;
  }
}