// src/lib/firestore/converters.ts

import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';

// Define um tipo base que todos os seus documentos podem estender.
// A presença do 'id' é garantida pelo conversor.
export interface BaseModel {
  id: string;
  createdAt?: FieldValue | Date;
  updatedAt?: FieldValue | Date;
}

// Conversor genérico aprimorado.
export const baseConverter = <T extends Omit<BaseModel, 'id'>>(): FirestoreDataConverter<T & { id: string }> => ({
  toFirestore: (data: Omit<T, 'id'> & Partial<{ id: string }>) => {
    const { id, ...firestoreData } = data; // Remove 'id' antes de salvar

    // Garante que createdAt só seja definido na criação.
    const finalData: any = {
        ...firestoreData,
        updatedAt: serverTimestamp(),
    };

    if (!data.createdAt) {
        finalData.createdAt = serverTimestamp();
    }

    return finalData;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): T & { id: string } => {
    const data = snapshot.data(options);
    
    // Converte todos os campos do tipo Timestamp de volta para objetos Date do JavaScript.
    Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
            data[key] = (data[key] as Timestamp).toDate();
        }
    });

    // Retorna o objeto de dados completo, adicionando o ID do documento a ele.
    return {
      ...data,
      id: snapshot.id,
    } as T & { id: string };
  },
});
