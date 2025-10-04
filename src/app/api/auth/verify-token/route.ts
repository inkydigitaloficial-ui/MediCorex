
import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Rota de API dedicada para validar um cookie de sessão do Firebase.
 * O middleware delega a validação para esta API para contornar as restrições do Edge Runtime.
 */
export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
  }

  try {
    // Usa o adminAuth para verificar a validade do cookie de sessão.
    // O segundo argumento `true` verifica se a sessão foi revogada.
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Retorna os dados do token decodificado, que inclui UID, email, e custom claims.
    return NextResponse.json(decodedToken, { status: 200 });
    
  } catch (error: any) {
    let errorMessage = 'Token inválido.';
    if (error.code === 'auth/session-cookie-expired') {
      errorMessage = 'Sessão expirada.';
    } else if (error.code === 'auth/session-cookie-revoked') {
      errorMessage = 'Sessão revogada.';
    }
    
    console.error('[API Verify Token] Erro:', error.code, errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

// Força a rota a ser dinâmica e a rodar no ambiente Node.js.
// Isso é crucial para que o Firebase Admin SDK funcione.
export const dynamic = 'force-dynamic';
