import { SkeletonListRows, SkeletonPageHeader } from '../../skeleton-parts';

export default function AdminDigestLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonListRows count={6} />
    </div>
  );
}
