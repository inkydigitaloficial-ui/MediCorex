
import { BaseModel } from './base';

/**
 * Representa o modelo de dados para um Paciente (ou Cliente) no Firestore.
 * Estende a BaseModel para incluir timestamps padronizados.
 */
export interface Paciente extends BaseModel {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    historicoConsultas?: string[]; 
}
