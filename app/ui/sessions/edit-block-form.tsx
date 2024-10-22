'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateSessionBlock, createSessionBlockWorkout, deleteSessionBlockWorkout } from '@/app/lib/actions';
import { SessionBlock, SessionBlockWorkout, ExerciseName, WorkoutExercise } from '@/app/lib/definitions';
import { PlusIcon, TrashIcon, PencilIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import EditWorkoutForm from '@/app/ui/workouts/edit-workout-form';

export default function EditBlockForm({ block, plan_id, exerciseNames }: { block: SessionBlock, plan_id: string, exerciseNames: ExerciseName[] }){
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentRef = useRef<HTMLDivElement>(null);

  const initialState = { message: null, errors: {} };
  const updateSessionBlockWithId = updateSessionBlock.bind(null, block.id);
  const [state, action] = useFormState(updateSessionBlockWithId, initialState);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateSessionBlock(block.id, state, formData);
    if (result.success) {
      block.name = result.block.name;
      block.description = result.block.description;
      setIsEditing(false);
    }
  }

  const [isCollapsed, setIsCollapsed] = useState(searchParams.get('block') != block.id);

  const [isEditingWorkout, setIsEditingWorkout] = useState<boolean[]>(new Array(block.workouts.length).fill(false));
  async function handleIsEditingWorkout(index : number) {
    const updatedList = isEditingWorkout.map(() => false)
    updatedList[index] = true;
    setIsEditingWorkout(updatedList);
  };

  async function handleCancelIsEditing() {
    const updatedList = isEditingWorkout.map(() => false)
    setIsEditingWorkout(updatedList);
  }

  const [addedWorkouts, setAddedWorkouts] = useState<SessionBlockWorkout[]>(block.workouts || []);

  async function handleAddWorkout() {
    const newWorkout : SessionBlockWorkout = {
      id: '',
      name: '',
      description: '',
      position: addedWorkouts.length > 0 ? addedWorkouts[addedWorkouts.length - 1].position + 1 : 0,
      workout_type: '',
      workout_value: '',
      exercises: []
    };
    const workout_id = await createSessionBlockWorkout(block.id, 
      addedWorkouts.length > 0 ? addedWorkouts[addedWorkouts.length - 1].position + 1 : 0);

    newWorkout.id = workout_id;
    setAddedWorkouts([...addedWorkouts, newWorkout]);

    const updatedList = isEditingWorkout.map(() => false)
    updatedList[updatedList.length] = true;
    setIsEditingWorkout(updatedList);
  };

  async function handleDeleteWorkout(indexToRemove: number) {
    const isConfirmed = window.confirm("¿Borrar este circuito?");
    if (isConfirmed) {
      const success =  await deleteSessionBlockWorkout(addedWorkouts[indexToRemove].id);
      if (success) {
        setAddedWorkouts(addedWorkouts.filter((_, index) => index !== indexToRemove));
        setIsEditingWorkout(isEditingWorkout.filter((_, index) => index !== indexToRemove));
      }
    }
  };

  async function handleEditWorkout() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('block', block.id);
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('block') == block.id) {
      componentRef.current?.scrollIntoView();
    }
  });

  return (
    <div className="grow" ref={componentRef}>

      { isEditing ? (
        <form onSubmit={handleSubmit}>
          <input id="plan_id" name="plan_id" type="hidden" defaultValue={plan_id} />
          <input id="session_id" name="session_id" type="hidden" defaultValue={block.session_id} />
          <input id="position" name="position" type="hidden" defaultValue={block.position} />

          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm">
              Nombre
            </label>
            <input 
              id="name"
              name="name"
              type="text"
              placeholder="Ingresa un nombre"
              defaultValue={block.name}
              className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
              aria-describedby="name-error"
            />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            { state.errors?.name && state.errors.name.map((error: string) => (
                <p key={error}> { error } </p>
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
              placeholder="Ingresa una descripción"
              defaultValue={block.description}
              className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
              aria-describedby="description-error"
            />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            { state.errors?.description && state.errors.description.map((error: string) => (
                <p key={error}> { error } </p>
              ))
            }
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Button type="submit">
              Guardar cambios
            </Button>
            <button
              type="button"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-row">
            <div className="text-left">
              <button
                type="button"
                className="p-1 m-1 ml-[-10px] rounded-md hover:bg-gray-100"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                { isCollapsed && <ChevronRightIcon className="w-5" /> }
                { !isCollapsed && <ChevronDownIcon className="w-5" /> }
              </button>
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-medium">{block.name}</div>
              { block.description && <div className="text-sm">{block.description}</div> }
              {/*<div className="text-sm" type=>Position {block.position}</div>*/}
            </div>
            <div className="grow text-right">
              <button
                type="button"
                className="rounded-md border p-2 mr-10 hover:bg-gray-100"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      { !isCollapsed &&
        <div className="m-2 mt-5">
          <div className="flex flex-row items-center">
            <label htmlFor="exercise" className="grow mb-2 block">
              Circuitos
            </label>
            <div className="flex gap-4">
              <button type="button" 
                className="rounded-md border p-2 text-sm font-medium flex bg-black text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                onClick={handleAddWorkout}
              >
                  <span>Agregar circuito</span>
                  <PlusIcon className="h-5 ml-2" />
              </button>
            </div>
          </div>
          {/*<label htmlFor="exercise" className="mb-2 block text-sm">
            Circuitos
          </label>
          <div className="flex gap-4">
            <button type="button" 
              className={`rounded-md border p-2 text-sm font-medium flex`}
              onClick={handleAddWorkout}
            >
                <span>Agregar circuito</span>
                <PlusIcon className="h-5 ml-2" />
            </button>
          </div>*/}
          <div className="mt-4">
            {addedWorkouts
                .sort((a: SessionBlockWorkout, b: SessionBlockWorkout) => a.position - b.position)
                .map((workout, index) => (
              <div key={index} className="relative mb-4 p-4 pb-8 border rounded-md shadow-sm bg-white">
                { isEditingWorkout[index] ? (
                  <div className="grow">
                    <EditWorkoutForm workout={workout} exerciseNames={exerciseNames} editCallback={handleEditWorkout} cancelCallback={handleCancelIsEditing} />
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 font-bold">
                      {workout.workout_type || "Circuito nuevo"}
                      {/*<div className="text-sm">Position {workout.position}</div>*/}
                    </div>

                    { workout.exercises?.sort((a: WorkoutExercise, b: WorkoutExercise) => a.position - b.position)
                        .map((exercise : WorkoutExercise) => (
                      <div key={workout.id + exercise.position + exercise.exercise_id}>
                        <div className="flex flex-row justify-between items-center gap-4">
                          <div className="flex-grow flex gap-4 smx:flex-col smx:gap-1">
                            <div>{exercise.reps}</div>
                            <div>{exercise.name}</div>
                            { exercise.weight && <div>({exercise.weight})</div> }
                          </div>
                          {exercise.image_url ? (
                            <Image
                              src={exercise.image_url}
                              width={150}
                              height={100}
                              alt={exercise.name}
                              className="border-2 rounded-lg"
                            />
                          ): (
                            <div className="w-[150px] h-[100px] border-2 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        { exercise.rest &&
                          <div className="mt-2">Descanso: {exercise.rest}</div>
                        }
                      </div>
                    ))}

                    <div className="absolute right-10 top-0 p-4">
                      <button type="button"
                        className="rounded-md border p-2 hover:bg-gray-100"
                        onClick={() => handleIsEditingWorkout(index)}
                      >
                        <PencilIcon className="w-5" />
                      </button>
                    </div>
                    <div className="absolute right-0 top-0 p-4">
                      <button type="button"
                        className="rounded-md border p-2 hover:bg-gray-100"
                        onClick={() => handleDeleteWorkout(index)}
                      >
                        <TrashIcon className="w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          { addedWorkouts.length == 0 &&
            <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <p className="text-sm text-gray-500 text-center">No hay circuitos</p>
            </div>
          }
        </div>
      }

    </div>
  );
}