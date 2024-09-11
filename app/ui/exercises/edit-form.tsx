'use client';

import { Exercise } from '@/app/lib/definitions'; 
import { updateExercise } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function EditForm({ exercise }: { exercise: Exercise }){
	const initialState = { message: null, errors: {} };
	const updateExerciseWithId = updateExercise.bind(null, exercise.id);
  const [state, action] = useFormState(updateExerciseWithId, initialState);
	
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
          defaultValue={exercise.name}
          aria-describedby="name-error"
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.name && state.errors.name.map((error: string) => (
            <p key={error}> { error } </p>
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
          defaultValue={exercise.description}
          aria-describedby="description-error"
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      <div>
        <label>
          Imagen
        </label>
        <input 
          id="image_url"
          name="image_url"
          type="text"
          placeholder="Ingresa el enlace a la imagen"
          defaultValue={exercise.image_url}
          aria-describedby="image_url-error"
        />
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
      <div id="image_url-error" aria-live="polite" aria-atomic="true">
        { state.errors?.image_url && state.errors.image_url.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      <div>
        <label>
          Video
        </label>
        <input 
          id="video_url"
          name="video_url"
          type="text"
          placeholder="Ingresa el enlace al video"
          defaultValue={exercise.video_url}
          aria-describedby="video_url-error"
        />
        {exercise.video_url && (
          <iframe 
            width="150" 
            height="100" 
            src={exercise.video_url}
            title={exercise.name} 
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

      <div>
        <Button type="submit">
          Editar ejercicio
        </Button>
        <Link href="/dashboard/exercises">
          Cancelar
        </Link>
      </div>

    </form>
	);
}