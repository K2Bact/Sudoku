/**
 * firebaseApp.js
 * Lazily initializes the Firebase app and Realtime Database.
 *
 * Config comes from Vite env vars, which live in a git-ignored `.env` (see
 * `.env.example`) — the same arrangement as android/keystore.properties. Firebase
 * web config is not strictly a secret (security comes from the database Rules,
 * not from hiding the API key), but keeping it out of the repo matches how this
 * project handles every other credential, and the pre-commit hook blocks the
 * `AIza…` pattern anyway.
 *
 * Everything is loaded on demand: a player who never opens 1v1 should not pay the
 * download or the connection.
 */

let dbPromise = null;

export function hasFirebaseConfig() {
  const env = import.meta.env || {};
  return Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_DATABASE_URL);
}

/**
 * Resolves to `{ db, ref, onValue, set, remove, onDisconnect, push, get, serverTimestamp }`
 * or `{ db: null }` when config is missing or the SDK fails to load.
 *
 * Returns a wrapper object rather than the database handle directly so callers
 * never `await` a value that might carry a `then` property.
 */
export function getDatabase() {
  if (dbPromise) return dbPromise;

  if (!hasFirebaseConfig()) {
    dbPromise = Promise.resolve({ db: null, reason: 'no_config' });
    return dbPromise;
  }

  dbPromise = (async () => {
    try {
      const env = import.meta.env;
      const [{ initializeApp, getApps }, rtdb] = await Promise.all([
        import('firebase/app'),
        import('firebase/database')
      ]);

      const config = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: env.VITE_FIREBASE_DATABASE_URL,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      };

      const app = getApps().length ? getApps()[0] : initializeApp(config);
      return {
        db: rtdb.getDatabase(app),
        ref: rtdb.ref,
        onValue: rtdb.onValue,
        onChildAdded: rtdb.onChildAdded,
        set: rtdb.set,
        update: rtdb.update,
        remove: rtdb.remove,
        push: rtdb.push,
        get: rtdb.get,
        onDisconnect: rtdb.onDisconnect,
        serverTimestamp: rtdb.serverTimestamp
      };
    } catch (e) {
      console.warn('[Firebase] init failed:', e?.message || e);
      return { db: null, reason: 'error' };
    }
  })();

  return dbPromise;
}
