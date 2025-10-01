'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';

import { useTenant } from '@/hooks/use-tenant';
import { generateCustomerInsightsAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters long.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Insights
        </>
      )}
    </Button>
  );
}

export function InsightsGenerator() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [state, formAction] = useFormState(generateCustomerInsightsAction, { insights: null, error: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const { pending } = useFormStatus();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className='font-headline'>Query Generator</CardTitle>
          <CardDescription>
            Describe the customer insights you want to generate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="tenantId" value={tenantId} />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Query</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Analyze the recent purchase behavior of users from California.'"
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className='font-headline'>Generated Insights</CardTitle>
          <CardDescription>
            The AI-powered insights will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pending ? (
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
            </div>
          ) : state.insights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                <p>{state.insights}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
                <p className="text-muted-foreground text-sm">Insights will be shown here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
