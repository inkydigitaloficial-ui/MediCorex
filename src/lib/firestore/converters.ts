// src/lib/firestore/converters.ts

import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

// Define um tipo base que todos os seus documentos podem estender.
// A presença do 'id' é garantida pelo conversor.
export interface BaseModel {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// O novo conversor genérico, implementado conforme a sua sugestão.
export const baseConverter = <T extends BaseModel>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => {
    const firestoreData = { ...data };
    // O `id` é gerenciado pelo Firestore e não deve ser salvo nos dados do documento.
    delete (firestoreData as any).id;

    // Garante que as datas sejam salvas como Timestamps do Firestore.
    return {
      ...firestoreData,
      createdAt: data.createdAt ? Timestamp.fromDate(data.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now(), // Sempre atualiza o updatedAt em cada escrita.
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): T => {
    const data = snapshot.data(options);
    
    // Converte todos os campos do tipo Timestamp de volta para objetos Date do JavaScript.
    // Isso é crucial para a consistência dos dados na aplicação.
    Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
            data[key] = (data[key] as Timestamp).toDate();
        }
    });

    // Retorna o objeto de dados completo, adicionando o ID do documento a ele.
    return {
      ...data,
      id: snapshot.id,
    } as T;
  },
});
