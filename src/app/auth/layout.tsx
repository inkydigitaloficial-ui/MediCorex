
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        // O layout agora é mínimo, pois cada página de autenticação terá seu próprio wrapper.
        <div className="bg-background min-h-screen">
            {children}
        </div>
    );
}
