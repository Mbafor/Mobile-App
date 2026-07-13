import { CreateOpportunityForm } from './CreateOpportunityForm';

export default function PartnerCreateOpportunityPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">Create Opportunity</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Post your own opportunity directly to Voila. It goes live immediately for students and on your partner page.
      </p>

      <section className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <CreateOpportunityForm />
      </section>
    </div>
  );
}
