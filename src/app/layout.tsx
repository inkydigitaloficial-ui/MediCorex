
import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseProvider } from '@/firebase/hooks';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';


const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-headline' });


export const metadata: Metadata = {
  title: 'MediCorex - Sistema de Gestão para Clínicas',
  description: 'Otimize a gestão da sua clínica com prontuários inteligentes, agenda e IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable, spaceGrotesk.variable)}>
        <FirebaseProvider>
            {children}
            <FirebaseErrorListener />
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
