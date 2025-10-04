
import { cookies, headers } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { Tenant } from '@/types/tenant'; 
import { DomainUtils } from '@/middleware/utils/domain-utils';
import { Timestamp } from 'firebase-admin/firestore';

export interface AuthContext {
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  tenantId: string | null;
  tenant: Tenant | null;
  role: string | null;
}

/**
 * @summary Função unificada para obter o contexto de autenticação do usuário no servidor.
 * @description Verifica o cookie de sessão, decodifica o token, extrai o subdomínio e busca
 * os dados do tenant correspondente, se houver. É a fonte de verdade para Server Components e layouts.
 * @param {string} [tenantIdFromParam] - Opcional. O tenantId extraído da URL, se disponível.
 * @returns {Promise<AuthContext | null>} Um objeto com os dados do usuário, tenant e role, ou nulo.
 */
export async function getCurrentUser(tenantIdFromParam?: string): Promise<AuthContext | null> {
  const cookieStore = cookies();
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

    if (!tenantId) {
       return { user: baseUser, tenantId: null, tenant: null, role: null };
    }

    const userTenants = (decodedToken.tenants as { [key: string]: string }) || {};
    const roleInTenant = userTenants[tenantId];
    
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
    const serializableTenant: Tenant = {
      ...tenantData,
      id: tenantDoc.id,
      trialEnds: tenantData.trialEnds instanceof Timestamp ? tenantData.trialEnds.toDate() : null,
      createdAt: tenantData.createdAt instanceof Timestamp ? tenantData.createdAt.toDate() : new Date(),
    };


    return {
      user: baseUser,
      tenantId: tenantId,
      tenant: serializableTenant,
      role: roleInTenant,
    };

  } catch (error: any) {
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
       // Erro esperado, o middleware vai redirecionar.
    } else {
        console.error('[getCurrentUser] Erro inesperado ao validar sessão:', error);
    }
    return null;
  }
}
