import EditCicleForm from '@/app/ui/cicles/edit-cicle-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchCicleById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { planId: string, cicleId: string } }) {
  const planId = params.planId;
  const cicleId = params.cicleId;

  const cicle = await fetchCicleById(cicleId);

  if (!cicle) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Planes', href: '/dashboard/plans' },
          {
            label: 'Editar plan',
            href: `/dashboard/plans/${planId}/edit`,
          },
          {
            label: 'Editar ciclo',
            href: `/dashboard/plans/${planId}/edit/cicles/${cicleId}/edit`,
            active: true,
          },
        ]}
      />
      <EditCicleForm cicle={cicle} />
    </main>
  );
}