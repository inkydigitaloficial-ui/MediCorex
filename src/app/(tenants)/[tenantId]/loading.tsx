
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <Skeleton className="h-5 w-[400px]" />
      </div>
      <div className="flex flex-1 rounded-lg border border-dashed shadow-sm p-4 lg:p-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-10 w-[160px]" />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
                <p className="text-muted-foreground text-sm">Loading insights...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
