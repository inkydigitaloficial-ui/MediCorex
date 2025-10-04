
import { Timestamp } from 'firebase-admin/firestore';

// Tipos para o lado do cliente
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trial_expired';
export type TenantPlan = 'free' | 'pro' | 'enterprise' | 'trial' | 'basico' | 'profissional' | 'premium';

// Interface base para o lado do cliente (usa Date)
export interface BaseClientModel {
    id: string;
    createdAt: Date;
    updatedAt?: Date;
}

// Tenant no lado do cliente
export interface Tenant extends BaseClientModel {
    name: string;
    slug: string;
    ownerId: string;
    active: boolean;
    plan: TenantPlan;
    subscriptionStatus: SubscriptionStatus;
    trialEnds?: Date | null; // Permite nulo
    settings: {
        theme?: string;
        language?: string;
        timezone?: string;
    };
}

// TenantUser no lado do cliente
export interface TenantUser extends BaseClientModel {
    tenantId: string;
    userId: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'owner_trial_expired';
    permissions?: string[];
    joinedAt: Date;
}


// --- Tipos para o lado do servidor (Firestore Admin, usam Timestamp) ---

export interface BaseServerModel {
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface TenantDocument extends BaseServerModel {
    name: string;
    slug: string;
    ownerId: string;
    active: boolean;
    plan: TenantPlan;
    subscriptionStatus: SubscriptionStatus;
    trialEnds?: Timestamp | null;
    settings: {
        theme?: string;
        language?: string;
        timezone?: string;
    };
}
