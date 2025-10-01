
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

// Trigger que dispara quando um documento em `tenant_users` é criado ou alterado.
export const updateUserClaimsOnRoleChange = functions.firestore
  .document("tenant_users/{docId}")
  .onWrite(async (change) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Se o documento foi deletado ou os dados essenciais não existem, para a execução.
    const data = afterData || beforeData;
    if (!data?.userId) return null;
    
    const { userId } = data;
    
    try {
      const user = await auth.getUser(userId);
      const currentClaims = user.customClaims || {};
      const userTenantsSnapshot = await db.collection("tenant_users").where("userId", "==", userId).get();

      const newTenantClaims: { [key: string]: string } = {};
      userTenantsSnapshot.forEach(doc => {
        const tenantUser = doc.data();
        if (tenantUser.tenantId && tenantUser.role) {
          newTenantClaims[tenantUser.tenantId] = tenantUser.role;
        }
      });

      // Atualiza os claims do usuário com o novo mapa de tenants/roles
      await auth.setCustomUserClaims(userId, { ...currentClaims, tenants: newTenantClaims });
      
      console.log(`Claims para o usuário ${userId} atualizados com sucesso.`);
      return null;
    } catch (error) {
      console.error(`Erro ao atualizar claims para o usuário ${userId}:`, error);
      return null;
    }
  });
