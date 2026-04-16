'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, Status } from '@/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ColumnProps {
  id: Status;
  title: string;
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      column: { id, title },
    },
  });

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBgColor = (status: Status) => {
    switch (status) {
      case 'pending': return 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20';
      case 'in-progress': return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20';
      case 'completed': return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';
      default: return 'bg-gray-50/50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-900/20';
    }
  };

  return (
    <div className={cn(
      "flex flex-col flex-shrink-0 w-full sm:w-[320px] rounded-2xl border transition-colors",
      getStatusBgColor(id),
      isOver ? 'ring-2 ring-primary/50' : ''
    )}>
      <div className="p-4 flex items-center justify-between border-b border-inherit bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", getStatusColor(id))} />
          <h3 className="font-semibold text-neutral-700 dark:text-neutral-200">
            {title}
          </h3>
          <span className="flex items-center justify-center bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-500 px-2 py-0.5 rounded-full shadow-sm border border-neutral-100 dark:border-neutral-700">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-1.5 text-neutral-500 hover:bg-white dark:hover:bg-neutral-700 rounded-lg transition-colors shadow-sm bg-white/50"
          title="Add Task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-3 min-h-[150px] overflow-y-auto custom-scrollbar">
        <div ref={setNodeRef} className="h-full space-y-3 flex flex-col">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={onEditTask} 
                onDelete={onDeleteTask} 
              />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl transition-all duration-200">
              <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                {isOver ? "Drop task here" : "No tasks yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
