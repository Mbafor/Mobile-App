import { SkeletonFormFields, SkeletonPageHeader, SkeletonSection } from '../../skeleton-parts';

export default function EditOpportunityLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <SkeletonSection>
        <SkeletonFormFields count={7} />
      </SkeletonSection>
    </div>
  );
}
