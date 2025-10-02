
// A simple, typed event emitter.
type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: { [K in keyof T]?: EventReceiver<T[K]>[] } = {};

  return {
    on(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).concat(fn);
    },
    off(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).filter(
        (f) => f !== fn
      );
    },
    emit(eventName, params) {
      (listeners[eventName] || []).forEach(function (fn) {
        fn(params);
      });
    },
  };
}

// FirestorePermissionError is defined in errors.ts
import { FirestorePermissionError } from './errors';

// Define the event map for our app
type AppEvents = {
  'permission-error': FirestorePermissionError;
};

// Export a singleton instance of the emitter
export const errorEmitter = createEmitter<AppEvents>();
