
// Adiciona esta nova função ao seu arquivo `functions/src/index.ts`

// Função agendada (Cron Job) para rodar todos os dias à meia-noite.
export const checkTrialEndings = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    console.log('Executando verificação diária de expiração de trials...');

    const now = admin.firestore.Timestamp.now();
    
    try {
        // Busca tenants em trial cuja data de expiração já passou.
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

            // 1. Atualiza o status da assinatura no tenant
            batch.update(doc.ref, { subscriptionStatus: 'trial_expired' });

            // 2. Busca o documento de associação para atualizar a role
            // O ID do documento é deterministicamente `userId_tenantId`
            const tenantUserRef = db.collection('tenant_users').doc(`${ownerId}_${tenantId}`);
            batch.update(tenantUserRef, { role: 'owner_trial_expired' });
        }

        await batch.commit();
        console.log(`${expiredTrialsSnapshot.size} tenants foram marcados como trial expirado.`);
        // A atualização em `tenant_users` irá disparar a função `updateUserClaimsOnRoleChange`,
        // que atualizará os custom claims do usuário, efetivamente bloqueando o acesso.

        return null;
    } catch (error) {
        console.error('Erro ao verificar e atualizar trials expirados:', error);
        return null;
    }
});

