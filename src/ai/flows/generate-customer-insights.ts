'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating customer insights with tenantId validation.
 *
 * The flow takes a tenantId and a query as input, validates the tenantId, and generates customer insights based on the query.
 * It uses a tool to determine whether the insights need to reference user behavior or user attributes.
 *
 * @interface GenerateCustomerInsightsInput - Defines the input schema for the generateCustomerInsights function.
 * @interface GenerateCustomerInsightsOutput - Defines the output schema for the generateCustomerInsights function.
 * @function generateCustomerInsights - An async function that calls the generateCustomerInsightsFlow with the input and returns the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCustomerInsightsInputSchema = z.object({
  tenantId: z.string().describe('The ID of the tenant.'),
  query: z.string().describe('The query to generate customer insights for.'),
});
export type GenerateCustomerInsightsInput = z.infer<typeof GenerateCustomerInsightsInputSchema>;

const GenerateCustomerInsightsOutputSchema = z.object({
  insights: z.string().describe('The generated customer insights.'),
});
export type GenerateCustomerInsightsOutput = z.infer<typeof GenerateCustomerInsightsOutputSchema>;

const needsUserBehaviorTool = ai.defineTool({
  name: 'needsUserBehavior',
  description: 'Determine if the customer insights query needs user behavior data.',
  inputSchema: z.object({
    query: z.string().describe('The query to generate customer insights for.'),
  }),
  outputSchema: z.boolean().describe('Whether the query needs user behavior data.'),
},
async (input) => {
    //Basic implementation, can be improved with a more sophisticated LLM call
    return input.query.toLowerCase().includes('behavior');
});

const needsUserAttributesTool = ai.defineTool({
    name: 'needsUserAttributes',
    description: 'Determine if the customer insights query needs user attributes data.',
    inputSchema: z.object({
      query: z.string().describe('The query to generate customer insights for.'),
    }),
    outputSchema: z.boolean().describe('Whether the query needs user attributes data.'),
  },
  async (input) => {
      //Basic implementation, can be improved with a more sophisticated LLM call
      return input.query.toLowerCase().includes('attributes');
  });

const generateCustomerInsightsPrompt = ai.definePrompt({
  name: 'generateCustomerInsightsPrompt',
  input: {schema: GenerateCustomerInsightsInputSchema},
  output: {schema: GenerateCustomerInsightsOutputSchema},
  tools: [needsUserBehaviorTool, needsUserAttributesTool],
  prompt: `You are an AI assistant that generates customer insights for a given tenant.

  Tenant ID: {{{tenantId}}}
  Query: {{{query}}}

  Instructions: Use the provided tenant ID and query to generate relevant and insightful customer insights.  
  Consider whether the query requires user behavior data or user attribute data and use the appropriate tool.
  Return the insights in a structured and easy-to-understand format.
  `,
});

const generateCustomerInsightsFlow = ai.defineFlow(
  {
    name: 'generateCustomerInsightsFlow',
    inputSchema: GenerateCustomerInsightsInputSchema,
    outputSchema: GenerateCustomerInsightsOutputSchema,
  },
  async input => {
    // Add tenant ID validation logic here if needed, e.g., check against a list of valid tenant IDs.
    if (!input.tenantId) {
      throw new Error('Tenant ID is required.');
    }

    const {output} = await generateCustomerInsightsPrompt(input);
    return output!;
  }
);

export async function generateCustomerInsights(input: GenerateCustomerInsightsInput): Promise<GenerateCustomerInsightsOutput> {
  return generateCustomerInsightsFlow(input);
}
