
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin'; // Importa a instância singleton

// Configuração do matcher para definir onde o middleware será executado
export const config = {
  matcher: [
    // Roda em todos os paths, exceto em rotas de API, arquivos estáticos do Next.js, imagens e páginas de autenticação.
    '/((?!api|_next/static|_next/image|favicon.ico|auth/.*|\\$|public/.*).+)',
  ],
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

// Função auxiliar para validar o token de autenticação do cookie
async function getValidToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('firebaseIdToken');

  if (!token?.value) return null;

  try {
    // Usa a instância singleton do adminAuth para verificar o token.
    // Não há mais inicialização repetida aqui.
    const decodedToken = await adminAuth.verifyIdToken(token.value);
    return decodedToken;
  } catch (error) {
    // Se o token for inválido ou expirado, ele será tratado como nulo.
    console.warn('Middleware: Token de autenticação inválido ou expirado.');
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Bloqueia acesso direto via IP ou hosts não configurados
  if (!hostname.includes(ROOT_DOMAIN)) {
    return new NextResponse(null, { status: 400, statusText: 'Bad Request' });
  }

  // Extrai o subdomínio
  const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
  
  // Se o subdomínio for o mesmo que o host raiz (e.g., acessando o site principal), não faz nada.
  if (subdomain === hostname.replace(`:${url.port}`,'')) {
    return NextResponse.next();
  }

  console.log(`Middleware: Roteando para subdomínio: ${subdomain}`);
  
  const decodedToken = await getValidToken();

  // Se não há um usuário autenticado, redireciona para a página de login específica do tenant.
  if (!decodedToken) {
    url.pathname = `/auth/login`; // A reescrita posterior cuidará de adicionar /_tenants/[tenant]
    return NextResponse.redirect(url);
  }

  // Extrai as permissões do usuário do token
  const userTenants = decodedToken.tenants as { [key: string]: string } | undefined;
  const roleInTenant = userTenants?.[subdomain];

  // Se o usuário não tem permissão para este tenant, redireciona para a página de "não autorizado"
  if (!roleInTenant) {
    console.warn(`Middleware: Acesso negado para usuário ${decodedToken.uid} ao tenant ${subdomain}.`);
    // Redireciona para uma página de erro genérica para não expor a existência de tenants
    const unauthorizedUrl = new URL('/auth/unauthorized', req.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Se o trial do usuário expirou, reescreve a URL para a página de cobrança
  if (roleInTenant === 'owner_trial_expired') {
    // Evita loop de redirecionamento se ele já estiver na página de cobrança
    if (url.pathname.startsWith('/billing')) {
        url.pathname = `/_tenants/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
    }
    console.log(`Middleware: Trial expirado para ${decodedToken.uid} no tenant ${subdomain}. Redirecionando para billing.`);
    url.pathname = `/_tenants/${subdomain}/billing`;
    return NextResponse.rewrite(url);
  }
  
  // Se tudo estiver OK, reescreve a URL para a estrutura de pastas interna do tenant
  url.pathname = `/_tenants/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
