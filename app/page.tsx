import { getTasks } from '@/lib/db';
import { Board } from '@/components/Board';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tasks = await getTasks();

  return (
    <main className="flex-1 w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
      <Board initialTasks={tasks} />
    </main>
  );
}
