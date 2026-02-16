import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/CustomUi/SkeletonCard";
import Container from "@/components/ui/CustomUi/Container";

/**
 * The `loading.tsx` body for every listing route — banner, toolbar and a grid of
 * card skeletons, so the layout does not jump when the products arrive.
 */
const CatalogSkeleton = () => (
  <Container className="py-6 md:py-10">
    <Skeleton className="h-5 w-48 mb-4" />
    <Skeleton className="h-40 md:h-52 w-full rounded-xl" />

    <div className="mt-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="lg:w-1/4 shrink-0 hidden lg:block">
        <Skeleton className="h-[420px] w-full rounded-lg" />
      </div>

      <div className="lg:w-3/4">
        <Skeleton className="h-14 w-full rounded-lg mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </div>
  </Container>
);

export default CatalogSkeleton;
