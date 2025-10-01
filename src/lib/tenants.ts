import 'server-only';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // for authentication when deployed on Google Cloud infrastructure.
  return initializeApp();
}

let db: Firestore;

try {
  const adminApp = initializeAdminApp();
  db = getFirestore(adminApp);
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  // If the SDK fails to initialize, we cannot proceed with DB operations.
  // We can throw an error or handle it gracefully depending on the desired behavior.
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
    // Re-throwing the error or returning null depends on how you want to handle it upstream.
    // For a layout, throwing might be caught by an error boundary.
    throw error;
  }
}

// You might still want a simple check for valid tenant formatting before hitting the DB
export function isValidTenantIdFormat(tenantId: string): boolean {
  // e.g., check for length, invalid characters, etc.
  return /^[a-zA-Z0-9-]+$/.test(tenantId);
}
