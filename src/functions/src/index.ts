
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays } from 'date-fns';

admin.initializeApp();
const db = admin.firestore();

export const createTenantForNewUser = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
  const { uid, displayName, email, photoURL } = user;
  
  if (!email) {
    functions.logger.error(`Usuário ${uid} criado sem email.`);
    return null;
  }
  
  const name = displayName || email.split('@')[0];
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const tenantSlug = `${baseSlug}-${uid.slice(0, 5)}`;

  const trialEndDate = addDays(new Date(), 7);

  const batch = db.batch();

  // 1. Documento do Tenant
  const tenantRef = db.collection('tenants').doc(tenantSlug);
  batch.set(tenantRef, {
    name: `Clínica ${name}`,
    ownerId: uid,
    active: true,
    plan: 'trial',
    subscriptionStatus: 'trialing',
    trialEnds: admin.firestore.Timestamp.fromDate(trialEndDate),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Documento de Perfil do Usuário
  const userProfileRef = db.collection('users').doc(uid);
  batch.set(userProfileRef, {
    name: name,
    email: email,
    photoURL: photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 3. Documento de Associação Tenant-Usuário
  const tenantUserRef = db.collection('tenant_users').doc(`${uid}_${tenantSlug}`);
  batch.set(tenantUserRef, {
    userId: uid,
    tenantId: tenantSlug,
    role: 'owner',
  });

  try {
    await batch.commit();
    functions.logger.info(`Tenant '${tenantSlug}' e perfil criados com sucesso para o usuário ${uid}.`);

    // 4. Definir Custom Claims (CRUCIAL para segurança)
    await admin.auth().setCustomUserClaims(uid, {
      tenants: {
        [tenantSlug]: 'owner'
      }
    });
    functions.logger.info(`Custom claims definidos para o usuário ${uid}.`);
    
    return null;
  } catch (error) {
    functions.logger.error(`Falha ao criar tenant e perfil para o usuário ${uid}:`, error);
    return null;
  }
});


export const updateUserClaimsOnRoleChange = functions.region('southamerica-east1').firestore
    .document('tenant_users/{tenantUserId}')
    .onWrite(async (change, context) => {

    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Se a role não mudou, não faz nada
    if (beforeData?.role === afterData?.role) {
        return null;
    }
    
    // Se o documento foi deletado, limpa os claims (lógica a ser implementada se necessário)
    if (!afterData) {
        return null;
    }

    const { userId, tenantId, role } = afterData;

    try {
        const user = await admin.auth().getUser(userId);
        const currentClaims = user.customClaims || {};

        const newClaims = {
            ...currentClaims,
            tenants: {
                ...(currentClaims.tenants || {}),
                [tenantId]: role,
            }
        };

        await admin.auth().setCustomUserClaims(userId, newClaims);
        functions.logger.info(`Claims atualizados para o usuário ${userId} no tenant ${tenantId}. Nova role: ${role}`);
        return null;

    } catch (error) {
        functions.logger.error(`Falha ao atualizar claims para o usuário ${userId}:`, error);
        return null;
    }
});


export const onUserCreate = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
  const { uid, displayName, email } = user;
  console.log(`Iniciando configuração para novo usuário: ${email} (ID: ${uid})`);

  // Lógica para gerar tenantId único
  const baseSlug = displayName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  let tenantId = baseSlug;
  let counter = 1;
  while (true) {
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) break;
    tenantId = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 10) {
      tenantId = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      break;
    }
  }
  console.log(`Slug final gerado para o tenant: ${tenantId}`);

  // Preparar dados para o batch
  const trialEnds = addDays(new Date(), 7);

  const tenantData = {
    id: tenantId,
    name: `Clínica ${displayName || email!.split('@')[0]}`,
    ownerId: uid,
    active: true,
    subscriptionStatus: 'trialing',
    trialEnds: admin.firestore.Timestamp.fromDate(trialEnds),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: { theme: 'light', language: 'pt-BR', timezone: 'America/Sao_Paulo' },
  };

  const tenantUserData = {
    userId: uid,
    tenantId: tenantId,
    email: user.email,
    role: 'owner',
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const userData = {
    uid: uid,
    displayName: displayName || '',
    email: email,
    photoURL: user.photoURL || null,
    disabled: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSignInTime: null,
    tenantIds: [tenantId], // Inicia com o primeiro tenant
  };

  // Referências dos documentos
  const tenantRef = db.collection('tenants').doc(tenantId);
  const tenantUserRef = db.collection('tenant_users').doc(`${uid}_${tenantId}`);
  const userRef = db.collection('users').doc(uid);

  // Executar operações em um batch
  const batch = db.batch();
  batch.set(tenantRef, tenantData);
  batch.set(tenantUserRef, tenantUserData);
  batch.set(userRef, userData, { merge: true }); // Usar merge para evitar sobreescrever dados existentes

  // Definir Custom Claims
  const claims = { tenants: { [tenantId]: 'owner' } };

  try {
    await Promise.all([
      batch.commit(),
      admin.auth().setCustomUserClaims(uid, claims),
    ]);
    functions.logger.info(`Tenant ${tenantId} e usuário ${uid} configurados com sucesso.`);
  } catch (error) {
    functions.logger.error(`Erro crítico ao configurar tenant para usuário ${uid}:`, error);
    throw error;
  }

  return null;
});

export const checkTrialEndings = functions.region('southamerica-east1').pubsub.schedule('every 24 hours').onRun(async (context) => {
  console.log('Executando verificação diária de expiração de trials...');
  const now = admin.firestore.Timestamp.now();

  try {
    const expiredTrialsSnapshot = await db.collection('tenants')
      .where('subscriptionStatus', '==', 'trialing')
      .where('trialEnds', '<', now)
      .get();

    if (expiredTrialsSnapshot.empty) {
      console.log('Nenhum trial expirado encontrado hoje.');
      return null;
    }

    const batch = db.batch();
    expiredTrialsSnapshot.docs.forEach(doc => {
      const tenant = doc.data();
      const tenantId = doc.id;
      const ownerId = tenant.ownerId;
      console.log(`Trial expirado para o tenant: ${tenantId}. Atualizando status.`);
      batch.update(doc.ref, { subscriptionStatus: 'trial_expired' });
      const tenantUserRef = db.collection('tenant_users').doc(`${ownerId}_${tenantId}`);
      batch.update(tenantUserRef, { role: 'owner_trial_expired' });
    });

    await batch.commit();
    console.log(`${expiredTrialsSnapshot.size} tenants foram marcados como trial expirado.`);
  } catch (error) {
    console.error('Erro ao verificar e atualizar trials expirados:', error);
  }

  return null;
});
