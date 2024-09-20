import CreateExerciseForm from '@/app/ui/exercises/create-exercise-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
 
export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { 
            label: 'Ejercicios', 
            href: '/dashboard/exercises',
            active: false,
          },
          {
            label: 'Crear ejercicio',
            href: '/dashboard/exercises/create',
            active: true,
          },
        ]}
      />
      <CreateExerciseForm />
    </main>
  );
}