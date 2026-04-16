export type Status = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DragItem {
  id: string;
  title: string;
  type: string;
}
