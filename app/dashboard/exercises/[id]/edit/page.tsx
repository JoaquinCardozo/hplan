import EditExerciseForm from '@/app/ui/exercises/edit-exercise-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchExerciseById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const exercise = await fetchExerciseById(id);

  if (!exercise) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Ejercicios', href: '/dashboard/exercises' },
          {
            label: 'Editar ejercicio',
            href: `/dashboard/exercises/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditExerciseForm exercise={exercise} />
    </main>
  );
}