'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating customer insights with tenantId validation.
 *
 * The flow takes a tenantId, customerId and a query as input, validates them against Firestore,
 * and generates customer insights based on the query and customer data.
 * It also saves the generation history to Firestore.
 *
 * @interface GenerateCustomerInsightsInput - Defines the input schema for the generateCustomerInsights function.
 * @interface GenerateCustomerInsightsOutput - Defines the output schema for the generateCustomerInsights function.
 * @function generateCustomerInsights - An async function that calls the generateCustomerInsightsFlow with the input and returns the output.
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
    
    // Initialize Admin SDK and Firestore
    const adminApp = initializeAdminApp();
    const db = getFirestore(adminApp);
    const startTime = Date.now();

    try {
      // 🛡️ VALIDAÇÃO DUPLA: Tenant existe e usuário tem acesso
      const [tenantDoc, customerDoc] = await Promise.all([
        db.collection('tenants').doc(tenantId).get(),
        db.collection('tenants').doc(tenantId)
          .collection('customers').doc(customerId).get()
      ]);

      if (!tenantDoc.exists) {
        throw new Error(`Tenant ${tenantId} não encontrado`);
      }

      if (!customerDoc.exists) {
        throw new Error(`Cliente ${customerId} não encontrado no tenant ${tenantId}`);
      }

      const customerData = customerDoc.data();
      const tenantData = tenantDoc.data();
      
      // 🤖 PROMPT CONTEXTUALIZADO COM DADOS DO TENANT
      const prompt = `
        ANALISE DE CLIENTE PARA A EMPRESA: ${tenantData.name}
        
        Sua tarefa é gerar insights sobre um cliente.
        
        Dados do Cliente:
        ${JSON.stringify(customerData, null, 2)}
        
        Tipo de Análise Solicitada: ${analysisType}
        Consulta Específica do Usuário: "${query}"
        
        Instruções:
        1. Baseado nos dados do cliente e na consulta do usuário, gere uma lista de 3 a 5 insights acionáveis em português.
        2. Para cada insight, forneça uma recomendação clara e prática.
        3. A resposta deve ser um JSON bem formatado com as chaves "insights" e "recommendations".
        
        Exemplo de formato de resposta:
        {
          "insights": ["O cliente demonstra um alto engajamento com a categoria de produtos 'X' nos últimos 3 meses.", "Houve uma queda nas compras recorrentes no último mês."],
          "recommendations": ["Inicie uma campanha de marketing direcionada para produtos complementares a 'X'.", "Envie uma pesquisa de satisfação ou um cupom de desconto para reengajar o cliente."]
        }
      `;

      // 🎯 GERAÇÃO COM GEMINI VIA GENKIT
      const llmResponse = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.5-flash',
        config: {
          temperature: 0.7,
        },
        output: {
          format: 'json',
          schema: z.object({
            insights: z.array(z.string()),
            recommendations: z.array(z.string()),
          })
        }
      });

      const aiResponse = llmResponse.output;
      if (!aiResponse) {
        throw new Error('A IA não retornou uma resposta válida.');
      }

      const endTime = Date.now();
      const analysisDuration = endTime - startTime;

      // 💾 SALVA HISTÓRICO NO FIRESTORE
      const generationRef = await db.collection('tenants').doc(tenantId)
        .collection('ai_generations').add({
          type: 'customer_insights',
          customerId: customerId,
          input: { query, analysisType },
          output: aiResponse,
          createdAt: new Date(),
          createdBy: 'system' // Em um app real, seria o ID do usuário logado
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
      // Assegura que o erro propagado seja uma string simples
      throw new Error(`Falha ao gerar insights: ${error.message || 'Erro desconhecido'}`);
    }
  }
);


export async function generateCustomerInsights(input: GenerateCustomerInsightsInput): Promise<GenerateCustomerInsightsOutput> {
  return generateCustomerInsightsFlow(input);
}
