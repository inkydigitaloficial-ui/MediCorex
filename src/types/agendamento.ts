
import { BaseModel } from '@/lib/firestore/converters';
import { FieldValue } from 'firebase/firestore';

/**
 * Representa o modelo de dados para um Agendamento no Firestore.
 */
export interface Agendamento extends Omit<BaseModel, 'createdAt'> {
    pacienteId: string;
    pacienteNome: string;
    start: Date; // A data e hora de início do agendamento
    title: string;
    status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
    createdBy: string; // UID do usuário que criou o agendamento
    createdAt: Date | FieldValue;
}
