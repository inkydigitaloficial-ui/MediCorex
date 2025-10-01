import 'server-only';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  return initializeApp();
}

let db: Firestore;

try {
  const adminApp = initializeAdminApp();
  db = getFirestore(adminApp);
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  throw new Error("Firebase Admin SDK could not be initialized.");
}


export async function getTenantData(tenantId: string): Promise<any | null> {
  if (!tenantId) {
    return null;
  }

  try {
    const tenantDocRef = db.collection('tenants').doc(tenantId);
    const tenantDoc = await tenantDocRef.get();

    if (!tenantDoc.exists) {
      console.log(`Tenant with ID ${tenantId} not found.`);
      return null;
    }

    return { id: tenantDoc.id, ...tenantDoc.data() };
  } catch (error) {
    console.error(`Error fetching tenant data for ${tenantId}:`, error);
    throw error;
  }
}

export function isValidTenantIdFormat(tenantId: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(tenantId);
}
