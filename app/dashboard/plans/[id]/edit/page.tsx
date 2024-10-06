import EditPlanForm from '@/app/ui/plans/edit-plan-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchPlanById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const plan = await fetchPlanById(id);

  if (!plan) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Planes', href: '/dashboard/plans' },
          {
            label: 'Editar plan',
            href: `/dashboard/planes/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditPlanForm plan={plan} />
    </main>
  );
}