import { SkeletonListRows, SkeletonPageHeader } from '../../../skeleton-parts';

export default function AdminOpportunitiesPendingLoading() {
  return (
    <div>
      <SkeletonPageHeader withAction />
      <SkeletonListRows count={8} />
    </div>
  );
}
