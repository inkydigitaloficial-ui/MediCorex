import { BaseModel } from '@/lib/firestore/converters';

/**
 * Representa o modelo de dados para um Paciente (ou Cliente) no Firestore.
 * Estende a BaseModel para incluir timestamps padronizados.
 * Não precisa incluir 'id' aqui, pois BaseModel já o cobre.
 */
export interface Paciente extends BaseModel {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    historicoConsultas?: string[]; 
}
