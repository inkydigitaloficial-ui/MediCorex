
import { BaseModel } from '@/lib/firestore/converters';

/**
 * Representa o modelo de dados para uma Consulta no Firestore.
 */
export interface Consulta extends BaseModel {
    summary: string;
    createdBy: string; // UID do usuário que criou
    createdAt: Date;
}
