import { SkeletonListRows, SkeletonPageHeader } from '../../../skeleton-parts';

export default function SuperAdminMentorshipExitsLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonListRows count={6} />
    </div>
  );
}
