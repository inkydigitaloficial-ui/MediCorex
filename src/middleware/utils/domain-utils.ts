
export class DomainUtils {
  
  /**
   * Extrai o subdomínio do hostname.
   * Ex: `app.dominio.com` -> `app`
   * Ex: `localhost:3000` -> `null`
   * Ex: `123-porta-workspace.cloudworkstations.dev` -> `123`
   */
  static getSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    
    // Em produção: acme.medicorex.app -> ['acme', 'medicorex', 'app'] (length 3)
    // Em dev local: acme.localhost:9002 -> ['acme', 'localhost:9002'] (length 2)
    // Em Cloud Workstation: acme.9002-....cloudworkstations.dev -> ['acme', '9002-....'] (length > 2)

    if (parts.length < 2) {
      return null;
    }

    // Se for localhost, o primeiro elemento é o subdomínio
    if (parts.length === 2 && parts[1].includes('localhost')) {
      if(parts[0] !== 'localhost') return parts[0];
      return null;
    }
    
    // Se for um domínio de produção ou cloud workstation, o primeiro elemento é o subdomínio.
    // Ignoramos subdomínios comuns como 'www'.
    if (parts.length > 2) {
        if (parts[0] === 'www') return null;
        return parts[0];
    }
    
    return null;
  }
  
  /**
   * Extrai o domínio raiz do hostname, lidando com ambientes de desenvolvimento.
   * Ex: `app.dominio.com` -> `dominio.com`
   * Ex: `app.localhost:3000` -> `localhost:3000`
   * Ex: `app.123-porta.cloudworkstations.dev` -> `123-porta.cloudworkstations.dev`
   */
  static getRootDomain(hostname: string): string {
    if (hostname.includes('localhost')) {
      return hostname.split('.').slice(1).join('.') || hostname;
    }
    
    const parts = hostname.split('.');
    if (parts.length > 2) {
      // Para hosts como 'acme.123.cloudworkstations.dev', retorna '123.cloudworkstations.dev'
      return parts.slice(1).join('.');
    }
    
    // Para 'medicorex.app', retorna ele mesmo.
    return hostname;
  }
}

    