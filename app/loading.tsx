export default function Loading() {
  return (
    <div className="w-full flex flex-col h-full min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="px-6 py-10 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
            <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-full" />
            <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto w-full p-6 pt-2">
        <div className="flex gap-6 items-start max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-full sm:w-[320px] h-[500px] rounded-2xl border border-neutral-100 dark:border-neutral-900 bg-white/50 dark:bg-neutral-900/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
