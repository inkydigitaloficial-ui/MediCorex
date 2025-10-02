import { NextRequest, NextResponse } from 'next/server';

/**
 * Representa o contexto que flui entre as cadeias do middleware.
 */
export interface MiddlewareContext {
  request: NextRequest;
  response: NextResponse;
  tenantId: string | null;
  user: any | null; // Dados do usuário decodificados do token
  config: typeof import('./config').middlewareConfig;
}

/**
 * Representa o resultado da execução de uma cadeia do middleware.
 */
export interface ChainResult {
  shouldContinue: boolean; // Se a próxima cadeia deve ser executada
  response?: NextResponse;    // A resposta a ser retornada (se shouldContinue for false)
  context?: Partial<MiddlewareContext>; // Atualizações para o contexto
}

/**
 * Representa o resultado da validação de um token.
 */
export interface AuthResult {
  isValid: boolean;
  user?: any;
  error?: string;
}
