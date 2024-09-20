'use client';

import { Exercise } from '@/app/lib/definitions'; 
import { updateExercise } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function EditExerciseForm({ exercise }: { exercise: Exercise }){
  const initialState = { message: null, errors: {} };
  const updateExerciseWithId = updateExercise.bind(null, exercise.id);
  const [state, action] = useFormState(updateExerciseWithId, initialState);
  
  const imageUrlRef = useRef<HTMLInputElement>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>();
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    setPreviewImageUrl(exercise.image_url);
    setPreviewVideoUrl(exercise.video_url);
  }, [exercise.image_url, exercise.video_url]);

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
          placeholder="Ingresa un nombre"
          defaultValue={exercise.name}
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
          defaultValue={exercise.description}
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

      <div className="mb-4">
        <label htmlFor="image_url" className="mb-2 block text-sm">
          Imagen
        </label>
        <div className="flex gap-4">
          <input 
            id="image_url"
            name="image_url"
            type="text"
            placeholder="Ingresa el enlace a la imagen"
            defaultValue={exercise.image_url}
            className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
            aria-describedby="image_url-error"
            ref={imageUrlRef}
          />
          <button type="button" className="rounded-md border p-2 hover:bg-gray-100 text-sm font-medium text-gray-600"
          onClick={()=> {
            if (imageUrlRef.current)
              setPreviewImageUrl(imageUrlRef.current.value);
          }}>
            <span>Preview</span>
          </button>
        </div>
        {previewImageUrl && (
          <Image
            src={previewImageUrl}
            width={150}
            height={100}
            alt={exercise.name}
            className="mt-2 border-2 rounded-lg"
          />
        )}
      </div>
      <div id="image_url-error" aria-live="polite" aria-atomic="true">
        { state.errors?.image_url && state.errors.image_url.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      <div className="mb-4">
        <label htmlFor="video_url" className="mb-2 block text-sm">
          Video
        </label>
        <div className="flex gap-4">
          <input 
            id="video_url"
            name="video_url"
            type="text"
            placeholder="Ingresa el enlace al video"
            defaultValue={exercise.video_url}
            className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
            aria-describedby="video_url-error"
            ref={videoUrlRef}
          />
          <button type="button" className="rounded-md border p-2 hover:bg-gray-100 text-sm font-medium text-gray-600"
          onClick={()=> {
            if (videoUrlRef.current)
              setPreviewVideoUrl(videoUrlRef.current.value);
          }}>
            <span>Preview</span>
          </button>
        </div>
        {previewVideoUrl && (
          <iframe 
            width="150" 
            height="100" 
            src={previewVideoUrl}
            title="Preview"
            className="mt-2 border-2 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />        
        )}
      </div>
      <div id="video_url-error" aria-live="polite" aria-atomic="true">
        { state.errors?.video_url && state.errors.video_url.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button type="submit">
          Editar ejercicio
        </Button>
        <Link href="/dashboard/exercises" className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Cancelar
        </Link>
      </div>

    </form>
  );
}