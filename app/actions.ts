'use server';

import { revalidatePath } from 'next/cache';
import { getTasks, saveTasks } from '@/lib/db';
import { Status, Task } from '@/types';

export const createTask = async (data: { title: string; description: string }) => {
  try {
    const tasks = await getTasks();
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: 'pending',
      order: tasks.filter(t => t.status === 'pending').length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await saveTasks(tasks);
    revalidatePath('/');
    return newTask;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await saveTasks(tasks);
    revalidatePath('/');
    return tasks[taskIndex];
  } catch (error) {
    throw error;
  }
};

export const moveTask = async (id: string, newStatus: Status, newOrder: number) => {
  try {
    let tasks = await getTasks();
    const taskToMove = tasks.find(t => t.id === id);

    if (!taskToMove) return;

    const oldStatus = taskToMove.status;
    const oldOrder = taskToMove.order;

    tasks = tasks.filter(t => t.id !== id);

    tasks.filter(t => t.status === oldStatus && t.order > oldOrder).forEach(t => {
      t.order -= 1;
    });

    tasks.filter(t => t.status === newStatus && t.order >= newOrder).forEach(t => {
      t.order += 1;
    });

    taskToMove.status = newStatus;
    taskToMove.order = newOrder;
    taskToMove.updatedAt = new Date().toISOString();
    tasks.push(taskToMove);

    await saveTasks(tasks);
    revalidatePath('/');
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (id: string) => {
  let tasks = await getTasks();
  const taskToDelete = tasks.find(t => t.id === id);

  if (!taskToDelete) return;

  const status = taskToDelete.status;
  const order = taskToDelete.order;

  tasks = tasks.filter(t => t.id !== id);

  // Adjust order of remaining tasks in that column
  tasks.filter(t => t.status === status && t.order > order).forEach(t => {
    t.order -= 1;
  });

  await saveTasks(tasks);
  revalidatePath('/');
};

export const updateTaskOrders = async (updates: { id: string, status: Status, order: number }[]) => {
  // Bulk update used mainly to sync optimistic UI to server if needed
  const tasks = await getTasks();
  
  updates.forEach(update => {
    const task = tasks.find(t => t.id === update.id);
    if (task) {
      task.status = update.status;
      task.order = update.order;
      task.updatedAt = new Date().toISOString();
    }
  });

  await saveTasks(tasks);
  revalidatePath('/');
}
