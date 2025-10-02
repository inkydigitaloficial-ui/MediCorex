
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// ✅ Importa a instância do DB já inicializada e segura
import { adminFirestore } from '@/lib/firebase/admin'; 

const TenantFlowInput = z.object({
  tenantId: z.string().min(1, "tenantId é obrigatório"),
});

const GenerateCustomerInsightsInputSchema = TenantFlowInput.extend({
  query: z.string().describe('The query to generate customer insights for.'),
  customerId: z.string().min(1, "customerId é obrigatório"),
  analysisType: z.enum(['comportamento', 'financeiro', 'geral']).default('geral'),
});
export type GenerateCustomerInsightsInput = z.infer<typeof GenerateCustomerInsightsInputSchema>;

const GenerateCustomerInsightsOutputSchema = z.object({
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  generatedAt: z.string(),
  metadata: z.object({
    customerName: z.string().optional(),
    analysisDuration: z.number(),
    generationId: z.string(),
  }),
});
export type GenerateCustomerInsightsOutput = z.infer<typeof GenerateCustomerInsightsOutputSchema>;

const generateCustomerInsightsFlow = ai.defineFlow(
  {
    name: 'generateCustomerInsightsFlow',
    inputSchema: GenerateCustomerInsightsInputSchema,
    outputSchema: GenerateCustomerInsightsOutputSchema,
  },
  async (input) => {
    const { tenantId, customerId, analysisType, query } = input;
    const startTime = Date.now();

    try {
      // ✅ Usa adminFirestore diretamente, sem reinicializar.
      const [tenantDoc, customerDoc] = await Promise.all([
        adminFirestore.collection('tenants').doc(tenantId).get(),
        // CORREÇÃO: A coleção é 'pacientes', não 'customers' como estava antes.
        adminFirestore.collection('tenants').doc(tenantId)
          .collection('pacientes').doc(customerId).get()
      ]);

      if (!tenantDoc.exists) {
        throw new Error(`Tenant ${tenantId} não encontrado`);
      }

      if (!customerDoc.exists) {
        // CORREÇÃO: Mensagem de erro reflete a coleção correta.
        throw new Error(`Paciente ${customerId} não encontrado no tenant ${tenantId}`);
      }

      const customerData = customerDoc.data();
      const tenantData = tenantDoc.data();
      
      const prompt = `
        ANALISE DE PACIENTE PARA A CLÍNICA: ${tenantData.name}
        
        Sua tarefa é gerar insights sobre um paciente.
        
        Dados do Paciente:
        ${JSON.stringify(customerData, null, 2)}
        
        Tipo de Análise Solicitada: ${analysisType}
        Consulta Específica: "${query}"
        
        Instruções:
        1. Gere uma lista de 3 a 5 insights acionáveis em português.
        2. Para cada insight, forneça uma recomendação clara.
        3. Retorne um JSON com as chaves "insights" e "recommendations".
      `;

      const llmResponse = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-pro',
        config: { temperature: 0.7 },
        output: {
          format: 'json',
          schema: z.object({ insights: z.array(z.string()), recommendations: z.array(z.string()) })
        }
      });

      const aiResponse = llmResponse.output;
      if (!aiResponse) {
        throw new Error('A IA não retornou uma resposta válida.');
      }

      const endTime = Date.now();
      const analysisDuration = endTime - startTime;

      const generationRef = await adminFirestore.collection('tenants').doc(tenantId)
        .collection('ai_generations').add({
          type: 'customer_insights',
          customerId: customerId,
          input: { query, analysisType },
          output: aiResponse,
          createdAt: new Date(),
          createdBy: 'system'
        });

      return {
        insights: aiResponse.insights || [],
        recommendations: aiResponse.recommendations || [],
        generatedAt: new Date().toISOString(),
        metadata: {
          customerName: customerData?.name,
          analysisDuration,
          generationId: generationRef.id
        }
      };

    } catch (error: any) {
      console.error('Erro no flow generateCustomerInsights:', error);
      throw new Error(`Falha ao gerar insights: ${error.message || 'Erro desconhecido'}`);
    }
  }
);

export async function generateCustomerInsights(input: GenerateCustomerInsightsInput): Promise<GenerateCustomerInsightsOutput> {
  return generateCustomerInsightsFlow(input);
}
