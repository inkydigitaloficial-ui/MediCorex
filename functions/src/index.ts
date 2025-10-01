
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays } from "date-fns";

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

// Gatilho que dispara quando um novo usuário do Firebase Auth é criado.
export const createTenantForNewUser = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, phoneNumber } = user;
    
    if (!uid || !email) {
        console.error("UID ou Email não encontrado para o novo usuário. Abortando.");
        return null;
    }

    // Usa o displayName (que foi setado no cliente) como prioridade.
    const name = displayName || email.split('@')[0];
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Garante que o slug seja único adicionando parte do UID.
    const tenantSlug = `${baseSlug}-${uid.slice(0, 5)}`;
    
    const trialEndsDate = addDays(new Date(), 7);

    const newUserProfile = {
        uid: uid,
        name: name, // Agora usa o nome correto
        email: email,
        phone: phoneNumber || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const newTenant = {
        name: `Clínica de ${name}`, // Nome da clínica usa o nome correto
        slug: tenantSlug,
        ownerId: uid,
        active: true,
        plan: 'trial',
        subscriptionStatus: 'trialing',
        trialEnds: admin.firestore.Timestamp.fromDate(trialEndsDate),
        settings: { language: 'pt-BR', timezone: 'America/Sao_Paulo' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const newTenantUser = {
        tenantId: tenantSlug,
        userId: uid,
        email: email,
        role: 'owner',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    batch.set(db.collection('users').doc(uid), newUserProfile);
    batch.set(db.collection('tenants').doc(tenantSlug), newTenant);
    // Cria com ID automático para evitar colisões e facilitar queries
    batch.set(db.collection('tenant_users').doc(`${uid}_${tenantSlug}`), newTenantUser);

    try {
        await batch.commit();
        console.log(`Perfil, Tenant e Associação criados com sucesso para o usuário ${uid}.`);
        
        // Dispara a atualização de claims imediatamente após a criação bem-sucedida.
        const claims = { tenants: { [tenantSlug]: 'owner' } };
        await auth.setCustomUserClaims(uid, claims);
        console.log(`Claims iniciais para o usuário ${uid} definidos com sucesso.`);
        
        return null;
    } catch (error) {
        console.error(`Erro ao criar dados para o usuário ${uid}:`, error);
        return null;
    }
});


// Trigger que dispara quando um documento em `tenant_users` é criado ou alterado.
export const updateUserClaimsOnRoleChange = functions.firestore
  .document("tenant_users/{docId}")
  .onWrite(async (change) => {
    const afterData = change.after.data();
    const beforeData = change.before.data(); // Usado para detectar deleções

    // Se o documento foi deletado ou os dados essenciais não existem, para a execução.
    const data = afterData || beforeData;
    if (!data?.userId) {
        console.log("Nenhum userId encontrado no documento. Encerrando.");
        return null;
    }
    
    const { userId } = data;
    
    try {
      // Busca todos os tenants associados ao usuário para construir os claims.
      const userTenantsSnapshot = await db.collection("tenant_users").where("userId", "==", userId).get();

      const newTenantClaims: { [key: string]: string } = {};
      userTenantsSnapshot.forEach(doc => {
        const tenantUser = doc.data();
        if (tenantUser.tenantId && tenantUser.role) {
          newTenantClaims[tenantUser.tenantId] = tenantUser.role;
        }
      });
      
      const user = await auth.getUser(userId);
      const currentClaims = user.customClaims || {};

      // Mescla os claims de tenant com outros claims existentes, se houver.
      const finalClaims = { ...currentClaims, tenants: newTenantClaims };

      // Compara os claims para evitar escritas desnecessárias
      if (JSON.stringify(currentClaims) === JSON.stringify(finalClaims)) {
        console.log(`Claims para o usuário ${userId} já estão atualizados. Nenhuma ação necessária.`);
        return null;
      }

      await auth.setCustomUserClaims(userId, finalClaims);
      
      console.log(`Claims para o usuário ${userId} atualizados com sucesso:`, newTenantClaims);
      return null;
    } catch (error) {
      console.error(`Erro ao atualizar claims para o usuário ${userId}:`, error);
      return null;
    }
  });
