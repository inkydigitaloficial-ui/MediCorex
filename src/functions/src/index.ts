
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays } from 'date-fns';

admin.initializeApp();
const db = admin.firestore();


/**
 * @deprecated Este gatilho está desativado. O fluxo de criação de tenant e usuário
 * agora é gerenciado por uma Server Action (`createClinicAction`) no front-end.
 * Isso proporciona um fluxo de onboarding mais rápido e controlável.
 * A função é mantida vazia para referência e para evitar execuções inesperadas.
 */
export const onUserCreate = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
    functions.logger.info(`Gatilho onUserCreate acionado para ${user.uid}, mas nenhuma ação é necessária. O fluxo foi migrado para Server Actions.`);
    return null;
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
    const now = new Date();

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
