import { Timestamp } from "firebase/firestore";

export interface Paciente {
    id?: string;
    nome: string;
    email: string;
    cpf?: string;
    dataNascimento?: Timestamp;
    telefone?: string;
    endereco?: {
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    historicoConsultas?: string[]; // IDs de consultas
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
