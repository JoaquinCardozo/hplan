'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useState } from 'react';
import { updateWorkout, CreateWorkoutState } from '@/app/lib/actions';
import { ExerciseName, Workout, WorkoutExercise, WorkoutWithExercises } from '@/app/lib/definitions';

export default function EditWorkoutForm({ workout, exerciseNames }: { workout: WorkoutWithExercises, exerciseNames: ExerciseName[] }){
  const initialState = { message: null, errors: {} };
  const [state, action] = useFormState(formatDataAndUpdateWorkout, initialState);

  const [workoutType, setWorkoutType] = useState<string>("rounds");
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutType(event.target.value);
  };

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [addedExercises, setAddedExercises] = useState<WorkoutExercise[]>(workout.exercises || []);

  const handleAddExercise = () => {
    if (selectedExerciseId) {
      const exerciseName = exerciseNames.find(exercise => exercise.id == selectedExerciseId);
      if (exerciseName) {
        const newExercise = {
          workout_id: workout.id,
          exercise_id: exerciseName.id,
          name: exerciseName.name,
          position: addedExercises.length,
          weight: "",
          reps: "",
          notes: "",
          rest: "",
          image_url: ""
        }
        setAddedExercises([...addedExercises, newExercise]);
        setSelectedExerciseId('');
      }
    }
  }

  async function formatDataAndUpdateWorkout(prevState: CreateWorkoutState, formData: FormData) {
    const exerciseIds = formData.getAll('exercise_id');
    const positions = formData.getAll('position');
    const weights = formData.getAll('weight');
    const reps = formData.getAll('reps');
    const notes = formData.getAll('notes');
    const rests = formData.getAll('rest');

    const workoutExercises = [];
    for (let i = 0; i < exerciseIds.length; i++) {
      workoutExercises.push({
        exercise_id: exerciseIds[i],
        position: Number(positions[i]),
        weight: weights[i],
        reps: reps[i],
        notes: notes[i],
        rest: rests[i],
      });
    }
    formData.append('workout_exercises', JSON.stringify(workoutExercises));
    ['exercise_id', 'position', 'weight', 'reps', 'notes', 'rest'].forEach(field => formData.delete(field));
    
    return updateWorkout(workout.id, prevState, formData);
  }
  
  return (
    <form action={action}>

      <div>
        <label htmlFor="name">
          Nombre
        </label>
        <input 
          id="name"
          name="name"
          type="text"
          placeholder="Ingresa un nombre"
          aria-describedby="name-error"
          defaultValue={workout.name}
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.name && state.errors.name.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div>
        <label>
          Descripción
        </label>
        <input 
          id="description"
          name="description"
          type="text"
          placeholder="Ingresa una descripción"
          aria-describedby="description-error"
          defaultValue={workout.description}
        />
      </div>
      <div id="description-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div>
        <label>
          Tipo de circuito
        </label>
        <div className="flex gap-4 p-2">
          <div className="flex items-center">
            <input
              id="rounds"
              name="workout_type"
              type="radio"
              value="rounds"
              aria-describedby="workout_type-error"
              onChange={handleOptionChange}
              defaultChecked={workout.workout_type === 'rounds'}
            />
            <label htmlFor="rounds" className="flex cursor-pointer p-2">
              Por rondas
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="amrap"
              name="workout_type"
              type="radio"
              value="amrap"
              onChange={handleOptionChange}
              defaultChecked={workout.workout_type === 'amrap'}
            />
            <label htmlFor="amrap" className="flex cursor-pointer p-2">
              AMRAP
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="emom"
              name="workout_type"
              type="radio"
              value="emom"
              onChange={handleOptionChange}
              defaultChecked={workout.workout_type === 'emom'}
            />
            <label htmlFor="emom" className="flex cursor-pointer p-2">
              Emom
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="workout_value">
            {workout.workout_type === 'rounds' && "Rondas"}
            {workout.workout_type === 'amrap' && "Tiempo"}
            {workout.workout_type === 'emom' && "Tiempo"}
          </label>
          <input 
            id="workout_value"
            name="workout_value"
            type="text"
            placeholder="Ingresa un valor"
            defaultValue={workout.workout_value}
          />
        </div>
      </div>
      <div id="workout_value-error" aria-live="polite" aria-atomic="true">
        { state.errors?.workout_value && state.errors.workout_value.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div>
        <label>
          Ejercicios
        </label>
        <div>
          <select
            id="exercise"
            name="exercise"
            value={selectedExerciseId}
            aria-describedby="workout_exercises-error"
            onChange={(e) => setSelectedExerciseId(e.target.value)}
          >
            <option value="" disabled>
              Selecciona un ejercicio
            </option>
            { exerciseNames.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  { exercise.name }
                </option>
              ))
            }
          </select>
          { selectedExerciseId && 
            <button type="button" className="rounded-md border p-2 hover:bg-gray-100"
            onClick={handleAddExercise}>
              <span>Agregar ejercicio</span>
            </button>
          }
        </div>
        <div>
          {addedExercises.map((exercise, index) => (
            <div key={index} className="">
              <h3>{exercise.name}</h3>
              <input id="exercise_id" name="exercise_id" type="hidden" defaultValue={exercise.exercise_id} />
              <input id="position" name="position" type="hidden" defaultValue={index} />
              <div>
                <label>Repeticiones: </label>
                <input
                  id="reps"
                  name="reps"
                  type="text"
                  placeholder="Ingresa la cantidad de repeticiones"
                  defaultValue={exercise.reps}
                />
              </div>
              <div>
                <label>Peso: </label>
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  placeholder="Ingresa el peso si corresponde"
                  defaultValue={exercise.weight}
                />
              </div>
              <div>
                <label>Aclaraciones: </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="Ingrese aclaraciones si es necesario"
                  defaultValue={exercise.notes}
                />
              </div>
              <div>
                <label>Descanso: </label>
                <input
                  id="rest"
                  name="rest"
                  type="text"
                  placeholder="Ingrese el descanso después del ejercicio"
                  defaultValue={exercise.rest}
                />
              </div>
            </div>
          ))}
        </div>
        <div id="workout_exercises-error" aria-live="polite" aria-atomic="true">
        { state.errors?.workout_exercises && state.errors.workout_exercises.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>
      </div>

      <div>
        <Button type="submit">
          Editar circuito
        </Button>
        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
        <Link href="/dashboard/workouts">
          Cancelar
        </Link>
      </div>

    </form>
  );
}