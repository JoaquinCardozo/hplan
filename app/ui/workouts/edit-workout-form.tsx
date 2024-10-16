'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { updateWorkout, CreateWorkoutState } from '@/app/lib/actions';
import { ExerciseName, SessionBlockWorkout, WorkoutExercise } from '@/app/lib/definitions';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EditWorkoutForm({ workout, exerciseNames, editCallback, cancelCallback }: { workout: SessionBlockWorkout, exerciseNames: ExerciseName[], editCallback: () => void, cancelCallback: () => void }){
  const state = { message: null, errors: [] };

  const [workoutType, setWorkoutType] = useState<string>(workout.workout_type);
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
          position: addedExercises.length > 0 ? addedExercises[addedExercises.length - 1].position + 1 : 0,
          weight: "",
          reps: "",
          notes: "",
          rest: "",
          image_url: "",
          video_url: "",
        }
        setAddedExercises([...addedExercises, newExercise]);
        setSelectedExerciseId('');
      }
    }
  }

  const handleRemoveExercise = (indexToRemove: number) => {
    setAddedExercises(addedExercises.filter((_, index) => index !== indexToRemove));
  };


  async function handleUpdateWorkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

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
    
    const result = await updateWorkout(workout.id, state, formData);
    if (result.success) {
      editCallback();
    }
    else {
      console.log(result);
    }
  }
  
  return (
    <form onSubmit={handleUpdateWorkout}>

      {/*<div className="mb-4">
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
          defaultValue={workout.name}
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.name && state.errors.name.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>*/}

      <div className="mb-4">
        <label htmlFor="workout_type" className="mb-2 block text-sm">
          Tipo de circuito
        </label>
        <input 
          id="workout_type"
          name="workout_type"
          type="text"
          className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
          placeholder="Ej: 4 rondas, AMRAP, EMOM, etc."
          aria-describedby="description-error"
          defaultValue={workout.workout_type}
        />
      </div>

      <div className="mt-10">
        {/*<label htmlFor="workout_type" className="block text-sm">
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
              defaultChecked={workout.workout_type === 'rounds'}
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
                  defaultValue={workout.workout_value}
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
              defaultChecked={workout.workout_type === 'amrap'}
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
                  defaultValue={workout.workout_value}
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
              defaultChecked={workout.workout_type === 'emom'}
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
                  defaultValue={workout.workout_value}
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
                defaultChecked={workout.workout_type === 'other'}
              />
              <label htmlFor="other" className="w-24 ml-3 block text-sm font-medium text-gray-700 cursor-pointer p-2">
                Otro
              </label>
              { workoutType === 'other' && 
                <input 
                  id="workout_value"
                  name="workout_value"
                  type="text"
                  className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  placeholder="Ingresa el tipo de ejercicio"
                  defaultValue={workout.workout_value}
                />
              }
            </div>
        </div>*/}
      </div>
      {/*<div id="workout_value-error" aria-live="polite" aria-atomic="true">
        { state.errors?.workout_value && state.errors.workout_value.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>*/}

      <div className="mt-10 mb-10">
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
          <button type="button" 
            className={`rounded-md border p-2 text-sm font-medium flex
              ${selectedExerciseId ? 'bg-black text-white transition-colors hover:bg-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            onClick={handleAddExercise}
            disabled={!selectedExerciseId}>
              <span>Agregar</span>
              <PlusIcon className="h-5 ml-2" />
          </button>
        </div>
        <div className="mt-4">
          {addedExercises
              .sort((a: WorkoutExercise, b: WorkoutExercise) => a.position - b.position)
              .map((exercise, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <div className="flex flex-row items-center">
                <div className="text-lg font-medium" >{exercise.name}</div>
                <div className="grow text-right">
                  <button
                    type="button"
                    className="rounded-md border p-2 hover:bg-gray-100"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    <span className="sr-only">Delete</span><TrashIcon className="w-5" />
                  </button>
                </div>
              </div>
              <input id="exercise_id" name="exercise_id" type="hidden" defaultValue={exercise.exercise_id} />
              <input id="position" name="position" type="hidden" defaultValue={index} />
              <div className="flex flex-row gap-2">
                <div className="grow mt-2">
                  <label htmlFor="reps" className="mb-2 block text-sm">Repeticiones: </label>
                  <input
                    id="reps"
                    name="reps"
                    type="text"
                    placeholder="Ingresa las repeticiones"
                    className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                    defaultValue={exercise.reps}
                  />
                </div>
              
                <div className="grow mt-2">
                  <label htmlFor="weight" className="mb-2 block text-sm">Peso: </label>
                  <input
                    id="weight"
                    name="weight"
                    type="text"
                    className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                    placeholder="Ingresa el peso"
                    defaultValue={exercise.weight}
                  />
                </div>
                <div className="grow mt-2">
                  <label htmlFor="rest" className="mb-2 block text-sm">Descanso: </label>
                  <input
                    id="rest"
                    name="rest"
                    type="text"
                    placeholder="Ingresa el descanso después del ejercicio"
                    className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                    defaultValue={exercise.rest}
                  />
                </div>
              </div>
              <div className="grow mt-2">
                <label htmlFor="notes" className="mb-2 block text-sm">Notas: </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="Ingresa notas adicionales"
                  className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
                  defaultValue={exercise.notes}
                />
              </div>
            </div>
          ))}
        </div>
        { addedExercises.length == 0 &&
          <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
            <p className="text-sm text-gray-500 text-center">No hay ejercicios</p>
          </div>
        }
      </div>
      <div id="workout_type-error" aria-live="polite" aria-atomic="true">
        { state.errors && state.errors.map((error: string) => (
            <p key={error} className="mt-2 text-sm text-red-500"> { error } </p>
          ))
        }
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Button type="submit">
          Guardar
        </Button>
        <Button type="button" onClick={cancelCallback} className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium transition-colors hover:bg-gray-200">
          <div className="text-gray-600">Cancel</div>
        </Button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.message && <p className="mt-2 text-sm text-red-500"> { state.message } </p>}
      </div>

    </form>
  );
}