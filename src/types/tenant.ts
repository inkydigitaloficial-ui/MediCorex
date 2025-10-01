import { Timestamp } from "firebase/firestore";

export interface Tenant {
    id?: string;
    name: string;
    slug: string; // subdomínio
    active: boolean;
    plan: 'free' | 'pro' | 'enterprise' | 'trial';
    trialEnds?: Timestamp;
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
