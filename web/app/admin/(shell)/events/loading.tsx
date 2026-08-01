import { SkeletonListRows, SkeletonPageHeader } from '../../skeleton-parts';

export default function AdminEventsLoading() {
  return (
    <div>
      <SkeletonPageHeader withAction />
      <SkeletonListRows count={6} />
    </div>
  );
}
