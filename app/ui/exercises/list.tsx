import Image from 'next/image';
import { UpdateExercise, DeleteExercise } from '@/app/ui/exercises/buttons';
import { fetchFilteredExercisesByPage } from "@/app/lib/data";

export default async function ExerciseList({ query, currentPage } : { query: string, currentPage: number }) {
  const exercises = await fetchFilteredExercisesByPage(query, currentPage);

  return (
   <div>
  {exercises?.map((exercise) => (
    <div key={exercise.id} className="flex items-center justify-between border-2 rounded-lg my-5">
      
      <div className="basis-1/2 p-5 ">
        <p className="font-bold">{exercise.name}</p>
        <p className="text-sm">{exercise.description}</p>
      </div>
      
      <div className="basis-1/4 p-3 justify-center items-center">
        <Image
          src={exercise.image_url}
          width={150}
          height={150}
          alt={exercise.name}
          className="border-2 rounded-lg"
        />
      </div>
      
      <div className="basis-1/4 p-5 flex justify-end space-x-2">
        <UpdateExercise id={exercise.id} />
        <DeleteExercise id={exercise.id} />
      </div>
    </div>
  ))}
</div>
  );  
} 
