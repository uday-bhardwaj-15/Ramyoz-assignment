'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Task, Status } from '@/types';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { TaskCard } from './TaskCard';
import { Search } from 'lucide-react';
import { moveTask, updateTaskOrders, deleteTask } from '@/app/actions';

interface BoardProps {
  initialTasks: Task[];
}

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'pending', title: 'Pending' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

export function Board({ initialTasks }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with server state
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Moving a Task over another Task
    if (isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Moving a Task over to an empty area of a Column
    if (isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        if (tasks[activeIndex].status !== overId) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = overId as Status;
          return arrayMove(newTasks, activeIndex, activeIndex); // Just change status, let it append
        }
        return tasks;
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isOverColumn = over.data.current?.type === 'Column';
    
    // Calculate new orders and prepare update
    const newTasks = [...tasks];
    
    // Set orders
    COLUMNS.forEach(col => {
      const colTasks = newTasks.filter(t => t.status === col.id);
      colTasks.forEach((t, i) => {
        t.order = i;
      });
    });

    setTasks(newTasks);

    // Find the task that was moved
    const movedTask = newTasks.find(t => t.id === activeId);
    if (movedTask) {
       // Fire server action silently for optimistic update
       try {
         await updateTaskOrders(newTasks.map(t => ({ id: t.id, status: t.status, order: t.order })));
       } catch (error) {
         console.error('Failed to sync changes', error);
         // Ideally revert state here if needed
       }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic delete
    setTasks(tasks.filter(t => t.id !== taskId));
    await deleteTask(taskId);
  };

  return (
    <div className="w-full flex flex-col h-full max-h-screen">
      {/* Header and Search */}
      <div className="px-6 py-6 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Task Board</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your team's tasks effortlessly.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-full bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white shadow-sm"
              />
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm"
            >
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Canvas */}
      <div className="flex-1 overflow-x-auto w-full custom-scrollbar p-6 pt-2">
        <div className="flex gap-6 min-h-full items-start max-w-7xl mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={filteredTasks
                  .filter((t) => t.status === col.id)
                  .sort((a, b) => a.order - b.order)}
                onAddTask={(status) => {
                  setEditingTask(null);
                  // Optionally pre-fill status here if we supported it in the modal
                  setIsModalOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            ))}
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } })
            }}>
              {activeTask ? (
                <TaskCard 
                  task={activeTask} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                  isOverlay 
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
    </div>
  );
}
