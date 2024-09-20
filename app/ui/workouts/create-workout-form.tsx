'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useState } from 'react';
import { createWorkout, CreateWorkoutState } from '@/app/lib/actions';
import { ExerciseName, WorkoutExercise } from '@/app/lib/definitions';

export default function CreateWorkoutForm({ exerciseNames }: { exerciseNames: ExerciseName[] }){
  const initialState = { message: null, errors: {} };
  const [state, action] = useFormState(formatDataAndCreateWorkout, initialState);

  const [workoutType, setWorkoutType] = useState<string>("rounds");
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutType(event.target.value);
  };

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [addedExercises, setAddedExercises] = useState<ExerciseName[]>([]);

  const handleAddExercise = () => {
    if (selectedExerciseId) {
      const exerciseName = exerciseNames.find(exercise => exercise.id == selectedExerciseId);
      if (exerciseName) {
        setAddedExercises([...addedExercises, exerciseName]);
        setSelectedExerciseId('');
      }
    }
  }

  async function formatDataAndCreateWorkout(prevState: CreateWorkoutState, formData: FormData) {
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
    
    return createWorkout(prevState, formData);
  }
  
  return (
    <form action={action}>

      <div className="mb-4">
        <label htmlFor="name" className="mb-2 block text-sm">
          Nombre
        </label>
        <input 
          id="name"
          name="name"
          type="text"
          className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
          placeholder="Ingresa un nombre"
          aria-describedby="name-error"
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.name && state.errors.name.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-2 block text-sm">
          Descripción
        </label>
        <input 
          id="description"
          name="description"
          type="text"
          className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
          placeholder="Ingresa una descripción"
          aria-describedby="description-error"
        />
      </div>
      <div id="description-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

        <div>
          <label htmlFor="workout_type" className="block text-sm">
            Tipo de circuito
          </label>
          <div className="flex flex-col p-2">
            <div className="flex items-center">
              <input
                id="rounds"
                name="workout_type"
                type="radio"
                value="rounds"
                className="h-4 w-4 border-gray-300"
                aria-describedby="workout_type-error"
                onChange={handleOptionChange}
                defaultChecked
              />
              <label htmlFor="rounds" className="w-24 ml-3 block text-sm font-medium text-gray-700 cursor-pointer p-2">
                Por rondas
              </label>
              { workoutType === 'rounds' && 
                <input 
                  id="workout_value"
                  name="workout_value"
                  type="text"
                  className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa la cantidad de rondas"
                />
              }
            </div>
            <div className="flex items-center">
              <input
                id="amrap"
                name="workout_type"
                type="radio"
                value="amrap"
                className="h-4 w-4 border-gray-300"
                onChange={handleOptionChange}
              />
              <label htmlFor="amrap" className="w-24 ml-3 block text-sm font-medium text-gray-700 cursor-pointer p-2">
                AMRAP
              </label>
              { workoutType === 'amrap' && 
                <input 
                  id="workout_value"
                  name="workout_value"
                  type="text"
                  className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa el tiempo"
                />
              }
            </div>
            <div className="flex items-center">
              <input
                id="emom"
                name="workout_type"
                type="radio"
                value="emom"
                className="h-4 w-4 border-gray-300"
                onChange={handleOptionChange}
              />
              <label htmlFor="emom" className="w-24 ml-3 block text-sm font-medium text-gray-700 cursor-pointer p-2">
                EMOM
              </label>
              { workoutType === 'emom' && 
                <input 
                  id="workout_value"
                  name="workout_value"
                  type="text"
                  className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa el tiempo"
                />
              }
            </div>
            <div className="flex items-center">
              <input
                id="other"
                name="workout_type"
                type="radio"
                value="other"
                className="h-4 w-4 border-gray-300"
                onChange={handleOptionChange}
              />
              <label htmlFor="emom" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer p-2">
                Otro
              </label>
              { workoutType === 'other' && 
                <input 
                  id="workout_value"
                  name="workout_value"
                  type="hidden"
                  className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa el tiempo"
                />
              }
            </div>
          </div>
        
        {/*<div className="grow">
          <label htmlFor="workout_value" className="block text-sm">
            { workoutType === 'rounds' && "Rondas" }
            { workoutType === 'amrap' && "Tiempo" }
            { workoutType === 'emom' && "Tiempo" }
          </label>
          <input 
            id="workout_value"
            name="workout_value"
            type="text"
            className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
            placeholder="Ingresa un valor"
          />
        </div>*/}
      </div>
      <div id="workout_value-error" aria-live="polite" aria-atomic="true">
        { state.errors?.workout_value && state.errors.workout_value.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div className="mb-4">
        <label htmlFor="exercise" className="mb-2 block text-sm">
          Ejercicios
        </label>
        <div className="flex gap-4">
          <select
            id="exercise"
            name="exercise"
            value={selectedExerciseId}
            className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
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
            <button type="button" className="rounded-md border p-2 hover:bg-gray-100 text-sm font-medium text-gray-600"
            onClick={handleAddExercise}>
              <span>Agregar ejercicio</span>
            </button>
          }
        </div>
        <div className="mt-4">
          {addedExercises.map((exercise, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <h3 className="text-lg font-medium">{exercise.name}</h3>
              <input id="exercise_id" name="exercise_id" type="hidden" defaultValue={exercise.id} />
              <input id="position" name="position" type="hidden" defaultValue={index} />
              <div className="mt-2">
                <label htmlFor="reps" className="mb-2 block text-sm">Repeticiones: </label>
                <input
                  id="reps"
                  name="reps"
                  type="text"
                  className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa la cantidad de repeticiones"
                />
              </div>
              <div className="mt-2">
                <label htmlFor="weight" className="mb-2 block text-sm">Peso: </label>
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa el peso"
                />
              </div>
              <div className="mt-2">
                <label htmlFor="notes" className="mb-2 block text-sm">Notas: </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Notas adicionales"
                />
              </div>
              <div className="mt-2">
                <label htmlFor="rest" className="mb-2 block text-sm">Descanso: </label>
                <input
                  id="rest"
                  name="rest"
                  type="text"
                  className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Tiempo de descanso"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="workout_exercises-error" aria-live="polite" aria-atomic="true">
        { state.errors?.workout_exercises && state.errors.workout_exercises.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div className="mt-4 flex justify-center">
        <Button type="submit">
          Crear entrenamiento
        </Button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.message && <p className="mt-2 text-sm text-green-500"> { state.message } </p>}
      </div>
    </form>
  );
}