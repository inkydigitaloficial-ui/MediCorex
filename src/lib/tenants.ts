import 'server-only';

// In a real application, you would replace this with a query to your database (e.g., Firestore)
// to check if the tenant exists and is active.

const validTenants = new Set(['tenant-a', 'tenant-b', 'acme']);

export async function isValidTenant(tenantId: string): Promise<boolean> {
  // Simulate network latency for a more realistic loading experience
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In a real app using Firestore, you might do something like this:
  // import { firestore } from './firebase'; // Your initialized admin firestore instance
  // const tenantDoc = await firestore.collection('tenants').doc(tenantId).get();
  // return tenantDoc.exists;

  return validTenants.has(tenantId);
}
