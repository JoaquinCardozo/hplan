import Image from 'next/image';
import { fetchFilteredExercisesByPage } from "@/app/lib/data";

export default async function ExerciseList({ query, currentPage } : { query: string, currentPage: number }) {
  const exercises = await fetchFilteredExercisesByPage(query, currentPage);

  return (
    <div>
      { exercises?.map((exercise) => (
        <div key={exercise.id}>
          <p className="">{ exercise.name }</p>
          <p className="text-sm">{ exercise.description }</p>
          <Image src={exercise.image_url} width={200} height={50} alt={exercise.name}/>
        </div>
        ))
      }
    </div>
  );  
} 
