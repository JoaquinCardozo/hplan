import CreateWorkoutForm from '@/app/ui/workouts/create-workout-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchExercisesNames } from '@/app/lib/data';
 
export default async function Page() {

  const exercises = await fetchExercisesNames();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { 
            label: 'Circuitos', 
            href: '/dashboard/workouts',
            active: false,
          },
          {
            label: 'Crear circuito de ejercicios',
            href: '/dashboard/workouts/create',
            active: true,
          },
        ]}
      />
      {/*<CreateWorkoutForm exerciseNames={exercises}/>*/}
    </main>
  );
}