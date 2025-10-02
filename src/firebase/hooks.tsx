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
    QueryDocumentSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { firebaseClient } from '@/lib/firebase/client';

// --- AuthProvider e useAuth ---
const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authInstance, setAuthInstance] = useState<Auth | null>(null);

    useEffect(() => {
        const auth = firebaseClient.auth;
        setAuthInstance(auth);

        // This listener handles the ID token cookie for server-side sessions.
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                document.cookie = `firebaseIdToken=${token}; path=/;`;
            } else {
                // On logout, clear the cookie.
                document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        });

        return () => unsubscribe();
    }, []);

    return <AuthContext.Provider value={authInstance}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    return useContext(AuthContext);
};


// --- useUser ---
interface UserState {
    user: User | null;
    isUserLoading: boolean;
}

/**
 * Hook to get the current authenticated user from Firebase.
 */
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

// --- FirestoreProvider e useFirestore ---
const FirestoreContext = createContext<Firestore | null>(null);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    // Initialize Firestore instance on the client
    setDb(firebaseClient.db);
  }, []);

  return (
    <FirestoreContext.Provider value={db}>
      {children}
    </FirestoreContext.Provider>
  );
}

export const useFirestore = () => {
    const firestore = useContext(FirestoreContext);
    if (!firestore) {
        // This check can be helpful but might be too strict if used in components
        // that conditionally need Firestore. For this app, it's a good safeguard.
        // throw new Error("useFirestore must be used within a FirestoreProvider");
    }
    return firestore;
};

// --- useMemoFirebase ---
/**
 * A hook to memoize Firebase queries and references to prevent re-renders.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T | null {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => {
        try {
            // The factory function (e.g., () => collection(db, 'path')) is executed.
            return factory();
        } catch (error) {
            // This can happen if Firebase isn't fully initialized, especially during hot reloads.
            console.warn("useMemoFirebase caught an error. This is often normal on initial load.", error);
            return null; // Return null to prevent crashing the component.
        }
    }, deps);
}

// --- useDoc ---
interface DocState<T> {
  data: T | null;
  isLoading: boolean;
}
/**
 * Hook for real-time listening to a single Firestore document.
 */
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
        }, (error) => {
            console.error("Error in useDoc:", error);
            // Here you would typically emit a global error
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);

    return { data, isLoading };
}

// --- useCollection ---
interface CollectionState<T> {
  data: T[];
  isLoading: boolean;
}
/**
 * Hook for real-time listening to a Firestore collection or query.
 */
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
        }, (error) => {
            console.error("Error in useCollection:", error);
             // Here you would typically emit a global error
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [query]);

    return { data, isLoading };
}
