import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TenantNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h1 className="text-4xl font-bold font-headline text-primary">Tenant Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The tenant you are trying to access does not exist or is currently unavailable. Please check the subdomain and try again.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
