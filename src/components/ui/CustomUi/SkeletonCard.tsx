import { Skeleton } from '../skeleton';

export const SkeletonCard = () => {
  return (
    <div className="flex flex-col space-y-3 rounded-xl border p-4 shadow-sm">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};
