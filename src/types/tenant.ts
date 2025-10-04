
import { BaseModel } from "./base";

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trial_expired';
export type TenantPlan = 'free' | 'pro' | 'enterprise' | 'trial';


export interface Tenant extends BaseModel {
    name: string;
    slug: string; // subdomínio
    ownerId: string; // ID do usuário que criou o tenant
    active: boolean;
    
    // Subscription details
    plan: TenantPlan;
    subscriptionStatus: SubscriptionStatus;
    trialEnds?: Date;
    stripeCustomerId?: string;

    settings: {
        theme?: string;
        language?: string;
        timezone?: string;
    };
}

export interface TenantUser extends BaseModel {
    tenantId: string;
    userId: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'owner_trial_expired';
    permissions: string[];
    joinedAt: Date;
}
