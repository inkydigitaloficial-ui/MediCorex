
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
  // For local dev, this setup assumes the emulator or a service account is configured.
  return initializeApp();
}

let db: Firestore;

try {
  const adminApp = initializeAdminApp();
  db = getFirestore(adminApp);
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK in tenants.ts:", error);
  // This will prevent the module from being used if initialization fails.
}


export async function getTenantData(tenantId: string): Promise<any | null> {
  if (!db) {
    throw new Error("Firestore is not initialized. Cannot fetch tenant data.");
  }
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

    const data = tenantDoc.data();
    // Convert Timestamps to serializable format (e.g., Date objects)
    if (data?.trialEnds?.toDate) {
      data.trialEnds = data.trialEnds.toDate();
    }
    if (data?.createdAt?.toDate) {
      data.createdAt = data.createdAt.toDate();
    }
    
    return { id: tenantDoc.id, ...data };
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
