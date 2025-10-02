'use client'

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive" />
            <h2 className="text-2xl font-bold font-headline">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-sm">
                An unexpected error occurred within this tenant space. You can try to reload the page.
            </p>
            <Button onClick={() => reset()}>
                Try again
            </Button>
        </div>
    </main>
  )
}
