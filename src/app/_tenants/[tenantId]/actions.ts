'use server';

import { gerarResumoPaciente } from '@/flows/pacientes/gerarResumoPaciente';
import { z } from 'zod';

const formSchema = z.object({
  query: z.string().min(10, { message: 'Query must be at least 10 characters long.' }),
  tenantId: z.string().min(1, { message: 'Tenant ID is required.' }),
  customerId: z.string().min(1, { message: 'Customer ID is required.' }),
});

type FormState = {
  result: Awaited<ReturnType<typeof gerarResumoPaciente>> | null;
  error: string | null;
};

export async function generateCustomerInsightsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // This action is currently not used but is kept for reference.
  // The logic has been moved to a direct call in the patient detail page.
  return { result: null, error: 'This action is deprecated.' };
}
