import fs from 'fs';
import path from 'path';
import { Task } from '../types';

const dataDir = path.join(process.cwd(), 'data');
const dbFile = path.join(dataDir, 'tasks.json');

// Initialize DB file if it doesn't exist
const initDb = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([]), 'utf-8');
  }
};

export const getTasks = async (): Promise<Task[]> => {
  initDb();
  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Failed to read tasks:', error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  initDb();
  try {
    fs.writeFileSync(dbFile, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write tasks:', error);
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
};
