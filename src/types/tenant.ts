import { Timestamp } from "firebase/firestore";

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type TenantPlan = 'free' | 'pro' | 'enterprise' | 'trial';


export interface Tenant {
    id?: string;
    name: string;
    slug: string; // subdomínio
    ownerId: string; // ID do usuário que criou o tenant
    active: boolean;
    
    // Subscription details
    plan: TenantPlan;
    subscriptionStatus: SubscriptionStatus;
    trialEnds?: Timestamp;
    stripeCustomerId?: string;

    settings: {
        theme?: string;
        language?: string;
        timezone?: string;
    };
    createdAt: Timestamp;
}

export interface TenantUser {
    tenantId: string;
    userId: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    permissions: string[];
    joinedAt: Timestamp;
}
