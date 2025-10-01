
'use server';

/**
 * @fileOverview Gera um resumo do prontuário do paciente usando IA,
 * com validação de acesso e auditoria.
 *
 * @function gerarResumoPaciente - O fluxo principal do Genkit.
 * @property {object} inputSchema - Define o que o fluxo espera como entrada.
 * @property {object} outputSchema - Define o que o fluxo retorna.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  return initializeApp();
}

const GerarResumoPacienteInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId é obrigatório"),
  pacienteId: z.string().min(1, "pacienteId é obrigatório"),
  userId: z.string().min(1, "userId é obrigatório para auditoria e validação"),
});
export type GerarResumoPacienteInput = z.infer<typeof GerarResumoPacienteInputSchema>;

export const gerarResumoPacienteFlow = ai.defineFlow({
  name: 'gerarResumoPacienteFlow',
  inputSchema: GerarResumoPacienteInputSchema,
  outputSchema: z.string(),
}, async (input) => {
  const adminApp = initializeAdminApp();
  const db = getFirestore(adminApp);
  
  const { tenantId, pacienteId, userId } = input;

  // 🛡️ VALIDAÇÃO DE SEGURANÇA NO BACKEND
  // Verifica se o usuário que fez a requisição pertence ao tenant
  const tenantUserQuery = await db.collection('tenant_users')
      .where('userId', '==', userId)
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();
  
  if (tenantUserQuery.empty) {
      throw new Error(`Acesso negado: Usuário ${userId} não pertence ao tenant ${tenantId}.`);
  }

  // Busca os dados do paciente
  const pacienteDocRef = db.doc(`tenants/${tenantId}/pacientes/${pacienteId}`);
  const pacienteDoc = await pacienteDocRef.get();

  if (!pacienteDoc.exists) {
    throw new Error(`Paciente com ID ${pacienteId} não encontrado no tenant ${tenantId}.`);
  }

  const pacienteData = pacienteDoc.data();
  // Em um caso real, você buscaria o histórico de consultas aqui.
  // const consultasSnapshot = await pacienteDocRef.collection('consultas').orderBy('date', 'desc').limit(5).get();
  // const ultimasConsultas = consultasSnapshot.docs.map(doc => doc.data());
  
  const prompt = `
    Você é um assistente médico altamente qualificado. Sua tarefa é analisar os dados de um paciente e o
    histórico de suas últimas consultas para gerar um resumo conciso e informativo para um profissional de saúde.
    O resumo deve ter no máximo 3 parágrafos e destacar condições crônicas, tratamentos recentes, 
    e quaisquer observações importantes ou pontos de atenção.

    Dados do Paciente: ${JSON.stringify(pacienteData)}
    
    Últimas Consultas: [Dados das últimas 5 consultas seriam inseridos aqui]
  `;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: prompt,
    config: { temperature: 0.3 },
  });

  const resumo = llmResponse.text();

  // 💾 Salva o resumo gerado para fins de auditoria
  await pacienteDocRef.collection('historico_ia').add({
    resumo: resumo,
    geradoEm: new Date(),
    geradoPor: userId,
  });

  return resumo;
});


export async function gerarResumoPaciente(input: GerarResumoPacienteInput): Promise<string> {
    return gerarResumoPacienteFlow(input);
}
