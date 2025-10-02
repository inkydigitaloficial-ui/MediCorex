
import { cookies, headers } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { Tenant } from '@/types/tenant'; 
import { DomainUtils } from '@/middleware/utils/domain-utils';


export interface AuthContext {
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  tenantId: string | null;
  tenant: Tenant | any; // Permite tenant ser nulo ou qualquer objeto
  role: string | null;
}

/**
 * @summary Função unificada para obter o contexto de autenticação do usuário no servidor.
 * @description Verifica o cookie de sessão, decodifica o token, extrai o subdomínio e busca
 * os dados do tenant correspondente, se houver. É a fonte de verdade para Server Components
 * e layouts.
 * @param {string} [tenantIdFromParam] - Opcional. O tenantId extraído da URL, se disponível.
 * @returns {Promise<AuthContext | null>} Um objeto com os dados do usuário, tenant e role, ou nulo.
 */
export async function getCurrentUser(tenantIdFromParam?: string): Promise<AuthContext | null> {
  const cookieStore = cookies();
  // Usa o cookie __session para validação de sessão segura no servidor.
  const sessionCookie = cookieStore.get('__session')?.value;
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const host = headers().get('host');
    const tenantIdFromSubdomain = DomainUtils.extractSubdomain(host);
    const tenantId = tenantIdFromParam || tenantIdFromSubdomain;

    const baseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    // Se não há um tenantId (acesso ao domínio principal), retorna apenas os dados do usuário.
    if (!tenantId) {
       return { user: baseUser, tenantId: null, tenant: null, role: null };
    }

    const userTenants = (decodedToken.tenants as { [key: string]: string }) || {};
    const roleInTenant = userTenants[tenantId];
    
    // Validação de segurança: se o usuário não tem a claim para o tenant, nega o acesso.
    if (!roleInTenant) {
      console.warn(`Acesso negado: Usuário ${decodedToken.uid} tentou acessar o tenant ${tenantId} sem permissão nos claims.`);
      return null;
    }

    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      console.error(`Inconsistência: Tenant com ID ${tenantId} não encontrado, mas o usuário tem a claim.`);
      return null;
    }
    
    const tenantData = tenantDoc.data() as Tenant;

    // Converte Timestamps para objetos Date para serem serializáveis para o cliente
    const serializableTenant = {
      ...tenantData,
      trialEnds: tenantData.trialEnds?.toDate ? tenantData.trialEnds.toDate() : null,
      createdAt: tenantData.createdAt?.toDate ? tenantData.createdAt.toDate() : null,
    };

    return {
      user: baseUser,
      tenantId: tenantId,
      tenant: serializableTenant,
      role: roleInTenant,
    };

  } catch (error) {
    // Erro comum: token expirado ou inválido. O middleware tratará do redirecionamento.
    // console.log('Falha ao validar o cookie de sessão:', error.code);
    return null;
  }
}
