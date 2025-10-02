
import { cookies } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { Tenant } from '@/types/tenant'; // Supondo que você tenha um tipo para Tenant

// Definindo os tipos para a resposta da função
export interface AuthContext {
  user: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  tenantId: string;
  tenant: Tenant;
  role: string;
}

/**
 * Função de utilidade para ser usada em Server Components.
 * Lê o cookie de autenticação, valida o token e busca os dados
 * do usuário e do tenant associado à requisição.
 */
export async function getCurrentUser(tenantIdFromParams: string): Promise<AuthContext | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('firebaseIdToken')?.value;
  
  if (!token) {
    return null;
  }

  try {
    // 1. Valida o token de autenticação
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userTenants = decodedToken.tenants as { [key: string]: string } | undefined;
    
    // 2. Verifica se o usuário tem permissão para o tenant da URL
    const roleInTenant = userTenants?.[tenantIdFromParams];
    if (!roleInTenant) {
      console.warn(`Usuário ${decodedToken.uid} tentou acessar o tenant ${tenantIdFromParams} sem permissão.`);
      return null;
    }

    // 3. Busca os dados do tenant no Firestore
    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantIdFromParams).get();
    if (!tenantDoc.exists) {
      console.error(`Tenant com ID ${tenantIdFromParams} não foi encontrado no Firestore, embora o usuário tenha permissão.`);
      return null;
    }

    // 4. Retorna o contexto de autenticação completo
    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      },
      tenantId: tenantIdFromParams,
      tenant: tenantDoc.data() as Tenant,
      role: roleInTenant,
    };

  } catch (error) {
    // O token pode ser inválido ou expirado
    console.log('Falha ao validar o token de sessão:', error);
    return null;
  }
}
