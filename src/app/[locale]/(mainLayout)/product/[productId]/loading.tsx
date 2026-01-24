import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/CustomUi/Container";
import { SkeletonCard } from "@/components/ui/CustomUi/SkeletonCard";

export default function Loading() {
  return (
    <Container className="py-6 md:py-10">
      <Skeleton className="h-5 w-64 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 md:w-20">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-16 h-16 md:w-20 md:h-20 rounded-md" />
            ))}
          </div>
          <Skeleton className="grow aspect-square rounded-lg" />
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      <Skeleton className="h-64 w-full rounded-lg" />

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </Container>
  );
}
