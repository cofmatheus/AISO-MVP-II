import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";

// Read Firebase configurations gracefully from Vite environment variables or mock the system
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
};


// Check if variables are configured
const isKeysConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isKeysConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Erro ao inicializar serviços locais do Firebase:", error);
  }
} else {
  console.warn(
    "Aviso AISO: Configurações do Firebase não encontradas ou incompletas. Cadastre VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID em .env.example para ativar sincronização em nuvem."
  );
}

export { auth, db, googleProvider, isKeysConfigured };

// Standardized Google Sign In Flow with automatic safe credentials degradation
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error("Firebase não configurado. Adicione chaves de ambiente.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Erro ao realizar autenticação populada via Google Auth:", error);
    throw error;
  }
}

// Global user profile remote db alignment
export async function syncUserProfile(uid: string, data: any) {
  if (!db) return;
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      name: data.name || "Membro Contemplativo",
      email: data.email || "",
      photoURL: data.photoURL || "",
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn("Falha ao salvar perfil remoto no Firestore:", error);
  }
}

// Remote persistence sync modules for PracticeSessions
export async function saveRemoteSession(uid: string, session: any) {
  if (!db) return;
  try {
    const sessionRef = doc(db, "users", uid, "sessions", session.id);
    await setDoc(sessionRef, {
      ...session,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Falha ao salvar sessão remota no Firestore:", err);
  }
}

export async function fetchRemoteSessions(uid: string) {
  if (!db) return [];
  try {
    const sessionCol = collection(db, "users", uid, "sessions");
    // Retrieve ordered by newest down to oldest matching offline user feel
    const snap = await getDocs(sessionCol);
    const result: any[] = [];
    snap.forEach((d) => {
      result.push(d.data());
    });
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Erro ao obter sessões remotas:", err);
    return [];
  }
}

// Remote persistence sync modules for distraction impulses logs (ErrorLogs)
export async function saveRemoteErrorLog(uid: string, log: any) {
  if (!db) return;
  try {
    const logRef = doc(db, "users", uid, "errorLogs", log.id);
    await setDoc(logRef, {
      ...log,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Falha ao registrar log de erro na nuvem:", err);
  }
}

export async function deleteRemoteErrorLog(uid: string, logId: string) {
  if (!db) return;
  try {
    const logRef = doc(db, "users", uid, "errorLogs", logId);
    await deleteDoc(logRef);
  } catch (err) {
    console.warn("Falha ao deletar log do Firestore:", err);
  }
}

export async function fetchRemoteErrorLogs(uid: string) {
  if (!db) return [];
  try {
    const logCol = collection(db, "users", uid, "errorLogs");
    const snap = await getDocs(logCol);
    const result: any[] = [];
    snap.forEach((d) => {
      result.push(d.data());
    });
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Erro ao obter logs de erro na nuvem:", err);
    return [];
  }
}

// Save & load app configuration settings on the cloud
export async function saveRemoteSettings(uid: string, settings: any) {
  if (!db) return;
  try {
    const settingsRef = doc(db, "users", uid, "settings", "global");
    await setDoc(settingsRef, {
      ...settings,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Falha ao salvar configurações remotas:", err);
  }
}

export async function fetchRemoteSettings(uid: string) {
  if (!db) return null;
  try {
    const settingsRef = doc(db, "users", uid, "settings", "global");
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error("Erro ao ler configurações na nuvem:", err);
  }
  return null;
}
