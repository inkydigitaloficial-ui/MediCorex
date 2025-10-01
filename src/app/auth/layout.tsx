import { Logo } from "@/components/logo";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center gap-2 text-primary">
                        <Logo className="h-8 w-8" />
                        <span className="text-2xl font-semibold font-headline">TenantFlow</span>
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
