import { SkeletonListRows, SkeletonPageHeader } from '../../../skeleton-parts';

export default function SuperAdminMenteesLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonListRows count={6} />
    </div>
  );
}
