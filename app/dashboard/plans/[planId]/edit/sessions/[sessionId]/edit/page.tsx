import EditSessionForm from '@/app/ui/sessions/edit-session-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchPlanById, fetchSessionById, fetchExercisesNames } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { planId: string, sessionId: string } }) {
  const planId = params.planId;
  const sessionId = params.sessionId;

  const plan = await fetchPlanById(planId);
  const session = await fetchSessionById(sessionId);

  if (!plan || !session) {
    notFound();
  }

  const exerciseNames = await fetchExercisesNames();
  
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
            label: 'Editar día',
            href: `/dashboard/plans/${plan.id}/edit/sessions/${sessionId}/edit`,
            active: true,
          },
        ]}
      />
      <EditSessionForm session={session} exerciseNames={exerciseNames} />
    </main>
  );
}