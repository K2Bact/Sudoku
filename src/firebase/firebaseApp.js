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
      const [{ initializeApp, getApps }, rtdb, auth] = await Promise.all([
        import('firebase/app'),
        import('firebase/database'),
        import('firebase/auth')
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

      // Sign in anonymously before handing the database back.
      //
      // The rules cannot tell one player from another today, so they constrain
      // shape and size and let anyone write. That is survivable for a closed
      // test and not for an open one: a script can fill the matchmaking queue
      // with tickets nobody can match, and every real player then waits twelve
      // seconds for an opponent that does not exist.
      //
      // An anonymous account is enough to fix that, because it gives the rules
      // an `auth` to require. It is not a login — the player never sees it, and
      // the id lives in the app's own storage.
      //
      // Failure here does not stop the app, but since the tightened rules were
      // published (BACKLOG FB-1) it stops 1v1 entirely: every read and write
      // needs `auth`. The transport asks before a search (canSearch) and the
      // lobby says it could not connect, instead of searching for twelve seconds
      // and then claiming nobody was there (BT-2).
      //
      // The uid it returns is carried out of here deliberately. It is the only
      // id the database can vouch for: rules can compare a written value against
      // auth.uid, and against nothing else. Everything the app generates itself
      // — including the player id in localStorage — is a string a peer can type.
      // That is what let a client send a message as somebody else (RT-2).
      //
      // `signIn` is handed out too, because this whole object is cached for the
      // session. A failed sign-in is often a rate limit or a dropped network that
      // passes; without a way to try again, one bad moment locked 1v1 out until
      // the app was restarted.
      const signIn = async () => {
        try {
          const cred = await auth.signInAnonymously(auth.getAuth(app));
          return cred?.user?.uid || auth.getAuth(app)?.currentUser?.uid || null;
        } catch (e) {
          console.warn('[Firebase] anonymous sign-in unavailable:', e?.code || e?.message || e);
          return null;
        }
      };
      const uid = await signIn();

      return {
        uid,
        signIn,
        db: rtdb.getDatabase(app),
        ref: rtdb.ref,
        onValue: rtdb.onValue,
        onChildAdded: rtdb.onChildAdded,
        set: rtdb.set,
        update: rtdb.update,
        remove: rtdb.remove,
        push: rtdb.push,
        get: rtdb.get,
        // 매치메이킹 티켓 선점에 필요하다. `get` 다음에 `remove` 를 부르면 두
        // 검색자가 같은 티켓을 둘 다 차지할 수 있다 — 읽기와 쓰기 사이가
        // 열려 있기 때문이다. runTransaction 은 그 틈을 없앤다.
        runTransaction: rtdb.runTransaction,
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
