import { SkeletonListRows, SkeletonPageHeader } from '../../../skeleton-parts';

export default function SuperAdminMentorsLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonListRows count={6} />
    </div>
  );
}
