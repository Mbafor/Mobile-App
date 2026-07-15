import { SkeletonFormFields, SkeletonPageHeader, SkeletonSection } from '../../skeleton-parts';

export default function CreateEventLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonSection>
        <SkeletonFormFields count={7} />
      </SkeletonSection>
    </div>
  );
}
