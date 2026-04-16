import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, get, set, child } from 'firebase/database';
import { Task } from '../types';
import fs from 'fs';
import path from 'path';

// --- Local Storage Logic (Fallback) ---
const dataDir = path.join(process.cwd(), 'data');
const dbFile = path.join(dataDir, 'tasks.json');

const initLocalDb = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([]), 'utf-8');
  }
};

const getLocalTasks = (): Task[] => {
  initLocalDb();
  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    return [];
  }
};

const saveLocalTasks = (tasks: Task[]) => {
  initLocalDb();
  fs.writeFileSync(dbFile, JSON.stringify(tasks, null, 2), 'utf-8');
};

// --- Firebase Logic (Realtime Database) ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Only initialize Firebase if Database URL is present
const isFirebaseConfigured = !!process.env.FIREBASE_DATABASE_URL;
let db: any = null;

if (isFirebaseConfigured) {
  console.log('🔥 Initializing Firebase Realtime Database...');
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getDatabase(app);
} else {
  console.log('📂 No Firebase URL found. Using local storage Fallback.');
}

// --- Unified API ---

export const getTasks = async (): Promise<Task[]> => {
  if (!isFirebaseConfigured) {
    return getLocalTasks();
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'tasks'));
    console.log('✅ Firebase read successful');
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        return data.filter(Boolean);
      }
      return Object.values(data) as Task[];
    }
    return [];
  } catch (error) {
    console.error('Firebase DB read failed, falling back to local:', error);
    return getLocalTasks();
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  if (!isFirebaseConfigured) {
    saveLocalTasks(tasks);
    return;
  }

  try {
    const taskRef = ref(db, 'tasks');
    await set(taskRef, tasks);
  } catch (error) {
    console.error('Firebase DB save failed, falling back to local:', error);
    saveLocalTasks(tasks);
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
};
