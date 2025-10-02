
import { Timestamp } from 'firebase/firestore';

/**
 * Interface base para todos os modelos de dados do Firestore.
 * Garante a padronização dos campos de timestamp.
 */
export interface BaseModel {
  id: string; // ID do documento
  createdAt: Timestamp; // Data de criação do registro
  updatedAt: Timestamp; // Data da última atualização do registro
}
