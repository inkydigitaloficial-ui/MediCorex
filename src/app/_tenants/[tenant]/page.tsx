import { InsightsGenerator } from './components/insights-generator';

export default function TenantPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <p className="text-muted-foreground">
          Enter a query below to generate AI-powered insights about your customers.
        </p>
      </div>
      <div className="flex flex-1 rounded-lg border border-dashed shadow-sm p-4 lg:p-6">
        <InsightsGenerator />
      </div>
    </main>
  );
}
