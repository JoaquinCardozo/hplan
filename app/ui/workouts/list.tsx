import Image from 'next/image';
import { UpdateWorkout, DeleteWorkout } from '@/app/ui/workouts/buttons';
import { fetchFilteredWorkoutsByPage } from "@/app/lib/data";
import { WorkoutExercise } from '@/app/lib/definitions';

export default async function WorkoutList({ query, currentPage} : { query: string, currentPage: number }){
	const workouts = await fetchFilteredWorkoutsByPage(query, currentPage);

	console.log(workouts)
	return (
		<div>
			{workouts?.map((workout) => (
				<div key={workout.id} className="flex flex-col border-2 rounded-lg my-5 p-3">

					<div className="relative flex items-center z-[-1]">
					  { 
					    workout.name ? (
					      <div className="grow font-bold text-center">{workout.name}</div>
					    ) : (
					      <div className="grow font-bold text-center">Sin nombre</div>
					    )
					  }
					  <div className="absolute right-0 flex space-x-2">
					    <UpdateWorkout id={workout.id} />
					    <DeleteWorkout id={workout.id} />
					  </div>
					</div>

					<div className="">
						{
		        	workout.name && 
		        		<p className="text-sm">{workout.description}</p>
		        }{ 
		        	workout.workout_type == "rounds" && 
		      			<p className="font-bold">{workout.workout_value} {workout.workout_value == 1 ? 'ronda' : 'rondas'}</p>
		      	}{
		      		workout.workout_type == "amrap" && 
		      			<p className="font-bold">AMRAP {workout.workout_value}</p>
		      	}{
							workout.workout_type == "emom" && 
		      			<p className="font-bold">EMOM {workout.workout_value}</p>
		      	}
		      </div>

		      {workout.exercises?.map((exercise : WorkoutExercise) => (
		      	<div key={workout.id + exercise.position + exercise.exercise_id} className="flex flex-row justify-between items-center space-x-4">
						  <div className="flex-grow flex space-x-4">
						    <div>{exercise.reps}</div>
						    <div>{exercise.name}</div>
						    { exercise.weight && <div>({exercise.weight} kg)</div> }
						  </div>
						  {exercise.image_url && (
					      <Image
					        src={exercise.image_url}
					        width={150}
					        height={100}
					        alt={exercise.name}
					        className="border-2 rounded-lg"
					      />
						  )}
						</div>
		      ))}
				</div>
			))}
		</div>
	);
}