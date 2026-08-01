import { SkeletonListRows, SkeletonPageHeader } from '../../skeleton-parts';

export default function AdminOpportunitiesLoading() {
  return (
    <div>
      <SkeletonPageHeader withAction />
      <SkeletonListRows count={8} />
    </div>
  );
}
