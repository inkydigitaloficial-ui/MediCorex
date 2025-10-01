'use server';

import { generateCustomerInsights } from '@/ai/flows/generate-customer-insights';
import { z } from 'zod';

const formSchema = z.object({
  query: z.string().min(10, { message: 'Query must be at least 10 characters long.' }),
  tenantId: z.string().min(1, { message: 'Tenant ID is required.' }),
  // Embora não venha do form, o customerId é necessário para a action
  customerId: z.string().min(1, { message: 'Customer ID is required.' }),
});

// O estado agora pode conter a resposta completa do fluxo
type FormState = {
  result: Awaited<ReturnType<typeof generateCustomerInsights>> | null;
  error: string | null;
};

export async function generateCustomerInsightsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    query: formData.get('query'),
    tenantId: formData.get('tenantId'),
    customerId: formData.get('customerId'),
  };

  const validatedFields = formSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // Acessa a primeira mensagem de erro de qualquer campo invalidado
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      result: null,
      error: firstError || 'Invalid input.',
    };
  }

  try {
    const result = await generateCustomerInsights({
      tenantId: validatedFields.data.tenantId,
      query: validatedFields.data.query,
      customerId: validatedFields.data.customerId,
      analysisType: 'comportamento', // Pode ser dinâmico no futuro
    });
    return { result, error: null };
  } catch (error) {
    console.error('Error generating insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { result: null, error: `Failed to generate insights: ${errorMessage}` };
  }
}