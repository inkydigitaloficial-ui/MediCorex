import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Rota de API dedicada para validar um ID Token do Firebase.
 * Esta rota roda no ambiente Node.js, permitindo o uso seguro do Firebase Admin SDK.
 * O middleware delega a validação para esta API para contornar as restrições do Edge Runtime.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
    }

    // Usa o adminAuth para verificar a validade do token.
    // O segundo argumento `true` verifica se o token foi revogado.
    const decodedToken = await adminAuth.verifyIdToken(token, true);

    // Retorna o token decodificado, que inclui UID, email, e custom claims.
    return NextResponse.json(decodedToken, { status: 200 });
    
  } catch (error: any) {
    console.error('[API Verify Token] Erro:', error.code, error.message);
    
    let errorMessage = 'Token inválido.';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expirado.';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Token revogado.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

// Força a rota a ser dinâmica e a rodar no ambiente Node.js.
// Isso é crucial para que o Firebase Admin SDK funcione.
export const dynamic = 'force-dynamic';
