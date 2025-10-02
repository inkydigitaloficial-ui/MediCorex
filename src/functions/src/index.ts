
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays } from 'date-fns';

admin.initializeApp();
const db = admin.firestore();

/**
 * @summary Gatilho do Firebase Auth que é acionado na criação de um novo usuário.
 * @description Esta função é o núcleo do processo de onboarding de um novo tenant (clínica).
 * 1. Gera um ID de tenant único (slug).
 * 2. Cria um documento para o novo tenant na coleção `tenants`.
 * 3. Cria um perfil para o usuário na coleção `users`.
 * 4. Cria um documento de associação na coleção `tenant_users`.
 * 5. Define os Custom Claims no objeto de usuário do Firebase Auth para controle de acesso.
 */
export const onUserCreate = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
    const { uid, displayName, email } = user;
    console.log(`Iniciando configuração para novo usuário: ${email} (ID: ${uid})`);

    if (!email) {
        functions.logger.error(`Usuário ${uid} foi criado sem um email. Abortando.`);
        return null;
    }

    // 1. GERAR TENANT_ID ÚNICO
    const nameForSlug = displayName || email.split('@')[0];
    const baseSlug = nameForSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
    let tenantId = baseSlug;
    let isUnique = false;
    let counter = 1;

    while (!isUnique) {
        const tenantDoc = await db.collection('tenants').doc(tenantId).get();
        if (!tenantDoc.exists) {
            isUnique = true;
        } else {
            tenantId = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    console.log(`Slug final gerado para o tenant: ${tenantId}`);

    const trialEnds = addDays(new Date(), 7);
    const batch = db.batch();

    // 2. CRIAR DOCUMENTO DO TENANT
    const tenantRef = db.collection('tenants').doc(tenantId);
    batch.set(tenantRef, {
        name: `Clínica de ${displayName || nameForSlug}`,
        ownerId: uid,
        active: true,
        plan: 'trial',
        subscriptionStatus: 'trialing',
        trialEnds: admin.firestore.Timestamp.fromDate(trialEnds),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. CRIAR PERFIL DO USUÁRIO
    const userProfileRef = db.collection('users').doc(uid);
    batch.set(userProfileRef, {
        name: displayName,
        email: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4. CRIAR ASSOCIAÇÃO TENANT-USUÁRIO
    const tenantUserRef = db.collection('tenant_users').doc(`${uid}_${tenantId}`);
    batch.set(tenantUserRef, {
        userId: uid,
        tenantId: tenantId,
        role: 'owner',
    });

    try {
        await batch.commit();
        functions.logger.info(`Documentos do Firestore criados com sucesso para o tenant ${tenantId}.`);

        // 5. DEFINIR CUSTOM CLAIMS (CRUCIAL PARA SEGURANÇA E ACESSO)
        await admin.auth().setCustomUserClaims(uid, {
            tenants: { [tenantId]: 'owner' }
        });
        functions.logger.info(`Custom claims definidos para o usuário ${uid}. Acesso ao tenant ${tenantId} como 'owner'.`);

        return null;

    } catch (error) {
        functions.logger.error(`Falha crítica ao criar tenant e perfil para o usuário ${uid}:`, error);
        // Lançar o erro pode fazer com que a função tente novamente, dependendo da sua configuração.
        throw new functions.https.HttpsError('internal', 'Não foi possível configurar a nova conta.');
    }
});


/**
 * @summary Mantém os Custom Claims do usuário sincronizados com suas permissões no Firestore.
 * @description Esta função é acionada sempre que um documento em `tenant_users` é alterado.
 * Ela lê a nova 'role' e a atualiza nos claims de autenticação do usuário.
 */
export const updateUserClaimsOnRoleChange = functions.region('southamerica-east1').firestore
    .document('tenant_users/{tenantUserId}')
    .onWrite(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();

        // Se a role não mudou, não há nada a fazer.
        if (beforeData?.role === afterData?.role) {
            return null;
        }

        // Se o documento foi deletado, a lógica para remover claims deve ser implementada aqui.
        if (!afterData) {
            // TODO: Implementar remoção de claims se um usuário for removido de um tenant.
            return null;
        }

        const { userId, tenantId, role } = afterData;

        try {
            const user = await admin.auth().getUser(userId);
            const currentClaims = user.customClaims || {};

            const newClaims = {
                ...currentClaims,
                tenants: {
                    ...(currentClaims.tenants as object || {}),
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

/**
 * @summary Verifica diariamente por trials que expiraram e atualiza seu status.
 */
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
        for (const doc of expiredTrialsSnapshot.docs) {
            const tenant = doc.data();
            const tenantId = doc.id;
            const ownerId = tenant.ownerId;
            console.log(`Trial expirado para o tenant: ${tenantId}. Atualizando status.`);

            batch.update(doc.ref, { subscriptionStatus: 'trial_expired' });

            const tenantUserRef = db.collection('tenant_users').doc(`${ownerId}_${tenantId}`);
            batch.update(tenantUserRef, { role: 'owner_trial_expired' });
        }

        await batch.commit();
        console.log(`${expiredTrialsSnapshot.size} tenants foram marcados como trial expirado.`);
    } catch (error) {
        console.error('Erro ao verificar e atualizar trials expirados:', error);
    }

    return null;
});
