
'use client';

import { Auth, onIdTokenChanged, User } from 'firebase/auth';
import {
    collection,
    doc,
    DocumentData,
    DocumentReference,
    Firestore,
    onSnapshot,
    Query,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { firebaseClient } from '@/lib/firebase/client';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// --- CENTRAL PROVIDER ---
const AuthContext = createContext<Auth | null>(null);
const FirestoreContext = createContext<Firestore | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  useEffect(() => {
    const { auth, db } = firebaseClient;
    setAuthInstance(auth);
    setDbInstance(db);

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        // O cookie `firebaseIdToken` é usado pelo middleware no Edge.
        // O cookie `__session` é usado pelas Server Actions/APIs no Node.js.
        // Manter ambos pode ser necessário dependendo da arquitetura.
        document.cookie = `firebaseIdToken=${token}; path=/;`;
      } else {
        document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authInstance}>
      <FirestoreContext.Provider value={dbInstance}>
        {children}
      </FirestoreContext.Provider>
    </AuthContext.Provider>
  );
}


// --- HOOKS ---

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useFirestore = () => {
    return useContext(FirestoreContext);
};

interface UserState {
    user: User | null;
    isUserLoading: boolean;
}

export function useUser(): UserState {
    const auth = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsUserLoading(false);
            return;
        }

        const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    return { user, isUserLoading };
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T | null {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => {
        try {
            return factory();
        } catch (error) {
            console.warn("useMemoFirebase caught an error. This is often normal on initial load.", error);
            return null;
        }
    }, deps);
}

interface DocState<T> {
  data: T | null;
  isLoading: boolean;
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null): DocState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!ref) {
            setData(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const unsubscribe = onSnapshot(ref, (snapshot) => {
            setData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null);
            setIsLoading(false);
        }, () => {
            const permissionError = new FirestorePermissionError({
              path: ref.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);

    return { data, isLoading };
}

interface CollectionState<T> {
  data: T[];
  isLoading: boolean;
}

export function useCollection<T>(query: Query | null): CollectionState<T> {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onSnapshot(query, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
            setData(items);
            setIsLoading(false);
        }, () => {
            const path = (query as any)._query?.path?.segments.join('/') || 'unknown path';
            const permissionError = new FirestorePermissionError({
                path: path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [query]);

    return { data, isLoading };
}
