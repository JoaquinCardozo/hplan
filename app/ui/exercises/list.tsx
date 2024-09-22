import Image from 'next/image';
import { UpdateExercise, DeleteExercise } from '@/app/ui/exercises/buttons';
import { fetchFilteredExercisesByPage } from "@/app/lib/data";

export default async function ExerciseList({ query, currentPage } : { query: string, currentPage: number }) {
  const exercises = await fetchFilteredExercisesByPage(query, currentPage);

  return (
   <div>
  {exercises?.map((exercise) => (
    <div key={exercise.id} className="flex smx:flex-col items-center justify-between border rounded-lg my-5">
      
      <div className="basis-1/4 p-5 smx:text-center">
        <p className="font-bold">{exercise.name}</p>
        <p className="text-sm">{exercise.description}</p>
      </div>
      
      <div className="basis-1/2 p-3 flex gap-2 justify-center items-center">
        {exercise.image_url ? (
          <Image
            src={exercise.image_url}
            width="150"
            height="100"
            alt={exercise.name}
            className="border-2 rounded-lg"
          />
        ) : (
          <div className="w-[150px] h-[100px] border-2 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}

        {exercise.video_url ? (
          <iframe 
            width="150" 
            height="100" 
            src={exercise.video_url}
            title={exercise.name} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="border-2 rounded-lg"
          />
        ) : (
          <div className="w-[150px] h-[100px] border-2 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Sin video</span>
          </div>
        )}
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
