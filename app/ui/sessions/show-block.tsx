'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateSessionBlock, createSessionBlockWorkout, deleteSessionBlockWorkout } from '@/app/lib/actions';
import { SessionBlock, SessionBlockWorkout, ExerciseName, WorkoutExercise } from '@/app/lib/definitions';
import { PlusIcon, TrashIcon, VideoCameraIcon, ArrowsPointingOutIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import EditWorkoutForm from '@/app/ui/workouts/edit-workout-form';

export default function ShowBlock({ block, plan_id }: { block: SessionBlock, plan_id: string }){
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentRef = useRef<HTMLDivElement>(null);

  const initialState = { message: null, errors: {} };
  const updateSessionBlockWithId = updateSessionBlock.bind(null, block.id);
  const [state, action] = useFormState(updateSessionBlockWithId, initialState);
  const [isEditing, setIsEditing] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [selectedNotes, setSelectedNotes] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const openImageModal = (name: string, description: string, notes: string, imageUrl: string, videoUrl: string) => {
    setSelectedName(name);
    setSelectedDescription(description);
    setSelectedNotes(notes);
    setSelectedImage(imageUrl);
    setSelectedVideo(videoUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedDescription('');
    setSelectedName('');
    setSelectedNotes('');
    setSelectedImage('');
    setSelectedVideo('');
  };

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
    <div ref={componentRef} className="w-full">
      <div>
        <button
          type="button"
          className="w-full p-3 rounded-md hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex gap-2 pl-2">
            { isCollapsed && <ChevronRightIcon className="w-5" /> }
            { !isCollapsed && <ChevronDownIcon className="w-5" /> }
            <div className="grow text-lg text-left font-bold">{block.name}</div>
          </div>
        </button>
      </div>

      <div>
      { !isCollapsed &&
        <div className="m-4 smx:m-2 mt-2"> 
          { block.description && <div className="pb-4 text-sm text-gray-400">{block.description}</div> }         
          
          <div className="flex flex-col gap-4 ">
            {addedWorkouts
                .sort((a: SessionBlockWorkout, b: SessionBlockWorkout) => a.position - b.position)
                .map((workout, index) => (
              <div key={index} className="relative p-4 border rounded-md shadow-sm bg-white">
                <div className="font-bold text-lg">{workout.workout_type || "Circuito nuevo"}</div>
                <div className="text-sm text-gray-400">{workout.description}</div>

                <div className="flex flex-col sm:gap-2 smx:gap-4">
                { workout.exercises?.sort((a: WorkoutExercise, b: WorkoutExercise) => a.position - b.position)
                    .map((exercise : WorkoutExercise) => (
                  <div key={workout.id + exercise.position + exercise.exercise_id}>
                    <div className="flex flex-row smx:flex-col justify-between sm:items-center gap-2">
                      <div className="flex flex-col">
                        <div className="flex-grow flex gap-2">
                          <div>{exercise.reps}</div>
                          <div>{exercise.name}</div>
                          { exercise.weight && <div>{exercise.weight}</div> }
                        </div>
                        <div className="smx:hidden">
                          { exercise.description &&
                            <div className="mt-2 text-sm text-gray-400">{exercise.description}</div>
                          }
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <div>
                          {exercise.image_url ? (
                            <div>
                              <div className="relative sm:w-[200px] smx:w-[150px] aspect-video">
                                <Image
                                  src={exercise.image_url}
                                  alt={exercise.name}
                                  fill
                                  className="object-cover border-2 rounded-lg"
                                  onClick={() => openImageModal(exercise.name, exercise.description, exercise.notes, exercise.image_url, exercise.video_url)}
                                />
                                
                                { exercise.video_url && (
                                  <div className="absolute bottom-2 left-2 bg-white p-1 rounded-full">
                                    <VideoCameraIcon className="w-4" />
                                  </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full">
                                  <ArrowsPointingOutIcon className="w-4" />
                                </div>
                              </div>

                              {isImageModalOpen && (
                                <div
                                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
                                  onClick={closeImageModal}
                                >
                                  <div className="relative max-w-3xl w-full smx:p-3 smx:pb-5 sm:p-10 flex flex-col gap-5 rounded-lg border-2 bg-white">

                                    <div className="text-center text-xl font-bold text-black sm:text-center">{selectedName}</div>
                                    <div className="text-gray-600 sm:text-center">{selectedDescription}</div>
                                    <div className="text-gray-600 sm:text-center">{selectedNotes}</div>

                                    <div className="relative aspect-[16/9] w-full" onClick={(e) => e.stopPropagation()} >
                                      <Image
                                        src={selectedImage}
                                        alt="Imagen de ejercicio"
                                        fill
                                        className="object-cover rounded-lg"
                                      />
                                    </div>

                                    {selectedVideo && (
                                      <div  className="relative aspect-[16/9] w-full h-full" onClick={(e) => e.stopPropagation()} >
                                          <iframe 
                                            src={selectedVideo}
                                            title="Preview"
                                            className="mt-2 border-2 w-full h-full rounded-lg"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                          />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ): (
                            <div className="w-[150px] h-[100px] border-2 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div className="sm:hidden">
                          { exercise.description &&
                            <div className="text-sm text-gray-400">{exercise.description}</div>
                          }
                        </div>
                      </div>
                    </div>
                    { exercise.notes &&
                      <div className="text-sm text-gray-400">{exercise.notes}</div>
                    }
                    { exercise.rest &&
                      <div className="mt-2">Descanso: {exercise.rest}</div>
                    }
                  </div>
                ))}
                </div>
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
    </div>
  );
}