import { SkeletonBar, SkeletonGridCards, SkeletonPageHeader, SkeletonSection } from '../skeleton-parts';

export default function DigestLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonSection>
        <div className="flex flex-wrap gap-3 mb-4">
          <SkeletonBar className="h-9 flex-1 min-w-[200px]" />
          <SkeletonBar className="h-9 w-36" />
        </div>
        <SkeletonGridCards count={6} />
      </SkeletonSection>
    </div>
  );
}
