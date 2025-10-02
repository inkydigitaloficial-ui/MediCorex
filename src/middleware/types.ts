import { NextRequest, NextResponse } from 'next/server';

export interface MiddlewareContext {
  request: NextRequest;
  response: NextResponse;
  tenantId?: string | null;
  user?: any;
  config: any;
}

export interface AuthResult {
  isValid: boolean;
  user?: any;
  error?: string;
  requiresAuth?: boolean;
}

export interface TenantResult {
  tenantId?: string | null;
  requiresRewrite: boolean;
  error?: string;
}

export interface ChainResult {
  shouldContinue: boolean;
  response?: NextResponse;
  context?: Partial<MiddlewareContext>;
}