import EditWorkoutForm from '@/app/ui/workouts/edit-workout-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchWorkoutById, fetchExercisesNames } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const workout = await fetchWorkoutById(id);
  const exercisesNames = await fetchExercisesNames();

  if (!workout) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Circuitos', href: '/dashboard/workouts' },
          {
            label: 'Editar circuito',
            href: `/dashboard/workouts/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/*<EditWorkoutForm workout={workout} exerciseNames={exercisesNames} editCallback={()=> {}} cancelCallback={()=> {}}/>*/}
    </main>
  );
}