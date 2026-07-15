import { SkeletonListRows, SkeletonPageHeader, SkeletonSection } from '../skeleton-parts';

export default function EventsLoading() {
  return (
    <div>
      <SkeletonPageHeader withAction />
      <SkeletonSection>
        <SkeletonListRows count={5} />
      </SkeletonSection>
    </div>
  );
}
