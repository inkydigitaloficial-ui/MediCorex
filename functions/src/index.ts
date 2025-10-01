
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
        phone: phoneNumber || null, // O telefone ainda virá do Auth se verificado
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
    batch.set(db.collection('tenant_users').doc(), newTenantUser); // Cria com ID automático

    try {
        await batch.commit();
        console.log(`Perfil, Tenant e Associação criados com sucesso para o usuário ${uid}.`);
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
