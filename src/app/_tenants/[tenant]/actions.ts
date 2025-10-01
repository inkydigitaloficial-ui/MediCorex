'use server';

import { generateCustomerInsights } from '@/ai/flows/generate-customer-insights';
import { z } from 'zod';

const formSchema = z.object({
  query: z.string().min(10, { message: 'Query must be at least 10 characters long.' }),
  tenantId: z.string().min(1, { message: 'Tenant ID is required.' }),
});

type FormState = {
  insights: string | null;
  error: string | null;
};

export async function generateCustomerInsightsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    query: formData.get('query'),
    tenantId: formData.get('tenantId'),
  };

  const validatedFields = formSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      insights: null,
      error: validatedFields.error.flatten().fieldErrors.query?.[0] || 'Invalid input.',
    };
  }

  try {
    const result = await generateCustomerInsights({
      tenantId: validatedFields.data.tenantId,
      query: validatedFields.data.query,
    });
    return { insights: result.insights, error: null };
  } catch (error) {
    console.error('Error generating insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { insights: null, error: `Failed to generate insights: ${errorMessage}` };
  }
}
