import { SkeletonBar, SkeletonGridCards, SkeletonPageHeader } from '../skeleton-parts';

export default function BrowseLoading() {
  return (
    <div>
      <SkeletonPageHeader />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SkeletonBar className="h-9 flex-1 min-w-[200px]" />
        <SkeletonBar className="h-9 w-40" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <SkeletonBar className="h-8 w-20" />
        <SkeletonBar className="h-8 w-24" />
        <SkeletonBar className="h-8 w-16" />
        <SkeletonBar className="h-8 w-28" />
      </div>

      <SkeletonGridCards count={6} />
    </div>
  );
}
