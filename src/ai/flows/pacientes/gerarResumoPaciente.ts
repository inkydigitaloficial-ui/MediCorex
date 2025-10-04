
'use server';

/**
 * @fileOverview Gera um resumo do prontuário do paciente usando IA,
 * com validação de acesso e auditoria.
 *
 * @function gerarResumoPacienteAction - Ação exportada que invoca o fluxo Genkit.
 * @property {object} GerarResumoPacienteInputSchema - Define o que o fluxo espera como entrada.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// Importa a instância única e já inicializada do Firestore Admin.
import { adminFirestore } from '@/lib/firebase/admin';
import { Consulta } from '@/types/consulta';

const GerarResumoPacienteInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId é obrigatório"),
  pacienteId: z.string().min(1, "pacienteId é obrigatório"),
  userId: z.string().min(1, "userId é obrigatório para auditoria e validação"),
});
export type GerarResumoPacienteInput = z.infer<typeof GerarResumoPacienteInputSchema>;

const gerarResumoPacienteFlow = ai.defineFlow({
  name: 'gerarResumoPacienteFlow',
  inputSchema: GerarResumoPacienteInputSchema,
  outputSchema: z.string(),
}, async (input) => {
  const { tenantId, pacienteId, userId } = input;

  // 🛡️ VALIDAÇÃO DE SEGURANÇA NO BACKEND
  // Verifica se o usuário que fez a requisição pertence ao tenant
  const tenantUserQuery = await adminFirestore.collection('tenant_users')
      .where('userId', '==', userId)
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();
  
  if (tenantUserQuery.empty) {
      throw new Error(`Acesso negado: Usuário ${userId} não pertence ao tenant ${tenantId}.`);
  }

  // Busca os dados do paciente e suas últimas consultas
  const pacienteDocRef = adminFirestore.doc(`tenants/${tenantId}/pacientes/${pacienteId}`);
  const [pacienteDoc, consultasSnapshot] = await Promise.all([
    pacienteDocRef.get(),
    pacienteDocRef.collection('consultas').orderBy('createdAt', 'desc').limit(5).get()
  ]);

  if (!pacienteDoc.exists) {
    throw new Error(`Paciente com ID ${pacienteId} não encontrado no tenant ${tenantId}.`);
  }

  const pacienteData = pacienteDoc.data();
  const ultimasConsultas = consultasSnapshot.docs.map(doc => doc.data() as Consulta);
  
  const prompt = `
    Você é um assistente médico altamente qualificado. Sua tarefa é analisar os dados de um paciente e o
    histórico de suas últimas consultas para gerar um resumo conciso e informativo para um profissional de saúde.
    O resumo deve ter no máximo 3 parágrafos e destacar condições crônicas, tratamentos recentes, 
    e quaisquer observações importantes ou pontos de atenção.

    Dados do Paciente: ${JSON.stringify(pacienteData)}
    
    Histórico das Últimas Consultas:
    ${ultimasConsultas.length > 0 ? ultimasConsultas.map(c => `- Em ${c.createdAt.toDate().toLocaleDateString()}: ${c.summary}`).join('\n') : 'Nenhuma consulta registrada ainda.'}
  `;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: prompt,
    config: { temperature: 0.3 },
  });

  const resumo = llmResponse.text;

  // 💾 Salva o resumo gerado para fins de auditoria
  await pacienteDocRef.collection('ai_audit_trail').add({
    resumo: resumo,
    prompt: prompt,
    geradoEm: new Date(),
    geradoPor: userId,
  });

  return resumo;
});


/**
 * Ação exportada que serve como ponto de entrada para o fluxo Genkit a partir do cliente.
 * @param input - Os dados de entrada que correspondem a GerarResumoPacienteInput.
 * @returns O resumo em string gerado pela IA.
 */
export async function gerarResumoPacienteAction(input: GerarResumoPacienteInput): Promise<string> {
    return gerarResumoPacienteFlow(input);
}
