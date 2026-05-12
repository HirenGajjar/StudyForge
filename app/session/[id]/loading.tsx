import { Skeleton } from '@/components/ui/skeleton'

export default function SessionLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-56 border-r border-gray-200 dark:border-gray-800 p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4 max-w-3xl">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  )
}
