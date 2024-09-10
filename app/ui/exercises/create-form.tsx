'use client';

import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { createExercise } from '@/app/lib/actions';

export default function Form(){
  const initialState = { message: null, errors: {} };
  const [state, action] = useFormState(createExercise, initialState);

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
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.name && state.errors.name.map((error: string) => (
            <p> { error } </p>
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
        />
      </div>
      <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p> { error } </p>
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
          placeholder="Ingresa el link a la imagen"
          aria-describedby="image_url-error"
        />
      </div>
      <div id="image_url-error" aria-live="polite" aria-atomic="true">
        { state.errors?.image_url && state.errors.image_url.map((error: string) => (
            <p> { error } </p>
          ))
        }
      </div>

      <div>
        <Button type="submit">
          Crear ejercicio
        </Button>
        <Link href="/dashboard/exercises">
          Cancelar
        </Link>
      </div>

    </form>
  );
}