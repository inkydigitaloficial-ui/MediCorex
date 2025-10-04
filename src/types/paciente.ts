import { BaseModel } from '@/lib/firestore/converters';

/**
 * Representa o modelo de dados para um Paciente (ou Cliente) no Firestore.
 * Estende a BaseModel para incluir timestamps padronizados.
 * Não precisa incluir 'id' aqui, pois BaseModel já o cobre.
 * createdAt é gerenciado por BaseModel e pelo conversor.
 */
export interface Paciente extends Omit<BaseModel, 'createdAt'> {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    historicoConsultas?: string[]; 
    createdAt: Date; // Garante que o tipo seja Date no lado do cliente
}
