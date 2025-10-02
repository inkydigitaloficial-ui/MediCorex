
import { BaseModel } from './base'; // Importa a interface base

/**
 * Representa o modelo de dados para um Paciente (ou Cliente) no Firestore.
 * Estende a BaseModel para incluir timestamps padronizados.
 */
export interface Paciente extends BaseModel {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    // O campo dataNascimento foi removido para simplificar,
    // conforme as regras de validação de schema que implementamos.
    // Pode ser adicionado de volta com a devida validação.

    // O endereço também foi removido temporariamente para alinhar com a validação.

    historicoConsultas?: string[]; // IDs de consultas (exemplo de relacionamento)
}
