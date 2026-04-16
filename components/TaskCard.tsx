'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Edit2, Trash2, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isOverlay?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isOverlay }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      onDelete(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl h-32"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isOverlay ? "rotate-2 scale-105 shadow-xl border-blue-500 ring-2 ring-blue-500/20 z-50 cursor-grabbing" : "",
        isDeleting ? "opacity-50 pointer-events-none" : ""
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm leading-snug break-words">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 md:mt-2">
        <div className="flex flex-wrap gap-1">
          {/* We can add pseudo tags or badges here later */}
        </div>
        <div className="flex items-center text-[10px] text-neutral-400 gap-1.5 font-medium ml-auto">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}
