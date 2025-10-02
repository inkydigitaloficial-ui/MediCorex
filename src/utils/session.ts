
import { cookies } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { Tenant } from '@/types/tenant'; 
import { DomainUtils } from '@/middleware/utils/domain-utils';
import { headers } from 'next/headers';

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

export async function getCurrentUser(): Promise<AuthContext | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('firebaseIdToken')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const host = headers().get('host');
    const tenantIdFromParams = DomainUtils.extractSubdomain(host);

    if (!tenantIdFromParams) {
       return {
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        },
        tenantId: null,
        tenant: null,
        role: null,
      };
    }

    const userTenants = decodedToken.tenants as { [key: string]: string } | undefined;
    const roleInTenant = userTenants?.[tenantIdFromParams];
    if (!roleInTenant) {
      console.warn(`Usuário ${decodedToken.uid} tentou acessar o tenant ${tenantIdFromParams} sem permissão.`);
      return null;
    }

    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantIdFromParams).get();
    if (!tenantDoc.exists) {
      console.error(`Tenant com ID ${tenantIdFromParams} não foi encontrado no Firestore, embora o usuário tenha permissão.`);
      return null;
    }

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
    console.log('Falha ao validar o token de sessão:', error);
    return null;
  }
}
