'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useRef, useState } from 'react';
import { createExercise } from '@/app/lib/actions';

export default function CreateForm(){
  const initialState = { message: null, errors: {} };
  const [state, action] = useFormState(createExercise, initialState);
  
  const imageUrlRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState();
  const videoUrlRef = useRef(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState();

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
          aria-describedby="image_url-error"
          ref={imageUrlRef}
        />
        <button type="button" className="rounded-md border p-2 hover:bg-gray-100"
        onClick={()=> {
          if (imageUrlRef.current)
            setPreviewImageUrl(imageUrlRef.current);
        }}>
          <span>Preview</span>
        </button>
        {previewImageUrl && (
          <Image
            src={previewImageUrl}
            width={150}
            height={100}
            alt="Preview"
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
          aria-describedby="video_url-error"
          ref={videoUrlRef}
        />
        <button type="button" className="rounded-md border p-2 hover:bg-gray-100"
        onClick={()=> {
          if (videoUrlRef.current)
            setPreviewVideoUrl(videoUrlRef.current);
        }}>
          <span>Preview</span>
        </button>
        {previewVideoUrl && (
          <iframe 
            width="150" 
            height="100" 
            src={previewVideoUrl}
            title="Preview"
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
          Crear ejercicio
        </Button>
        <Link href="/dashboard/exercises">
          Cancelar
        </Link>
      </div>

    </form>
  );
}