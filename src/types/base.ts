
import { Timestamp } from 'firebase/firestore';

/**
 * Interface base para todos os modelos de dados do Firestore.
 * Garante a padronização dos campos de timestamp.
 * É estendida por outras interfaces de modelo como Paciente e Tenant.
 */
export interface BaseModel {
  id: string; // ID do documento, adicionado pelo conversor do Firestore.
  createdAt?: Timestamp | Date; // Data de criação do registro.
  updatedAt?: Timestamp | Date; // Data da última atualização do registro.
}
