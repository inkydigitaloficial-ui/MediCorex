
import { ReactNode } from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
            {/* Gradiente de fundo */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
            
            {/* Logo no topo */}
            <div className="absolute top-6 left-6 z-10">
                <Link href="/" className="flex items-center gap-2 text-primary">
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-semibold font-headline">MediCorex</span>
                </Link>
            </div>
            
            {/* Conteúdo centralizado */}
            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
