import ShowPlan from '@/app/ui/plans/show-plan';
import { fetchPlanById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { planId: string } }) {
  const id = params.planId;
  const plan = await fetchPlanById(id);
  
  if (!plan) {
    notFound();
  }
  
  return (
    <main>
      <ShowPlan plan={plan} />
    </main>
  );
}