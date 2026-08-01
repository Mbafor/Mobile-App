import { SkeletonListRows, SkeletonPageHeader } from '../../../skeleton-parts';

export default function SuperAdminAdminsLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonListRows count={6} />
    </div>
  );
}
