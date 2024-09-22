'use client';

import { Button } from '@/app/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useRef, useState } from 'react';
import { createExercise } from '@/app/lib/actions';


export default function CreateExerciseForm(){
  const initialState = { message: null, errors: {} };
  const [state, action] = useFormState(createExercise, initialState);
  
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | undefined>();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleVideoPreview = (link : string) => {
    return 'https://www.youtube.com/embed/' + link.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
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
          placeholder="Ingresa un nombre"
          className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
          aria-describedby="name-error"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          { state.errors?.name && state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}> { error } </p>
            ))
          }
        </div>
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
          className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
          aria-describedby="description-error"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          { state.errors?.description && state.errors.description.map((error: string) => (
              <p key={error}> { error } </p>
            ))
          }
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="image_url" className="mb-2 block text-sm">
          Imagen
        </label>
        <label className="rounded-md border p-2 hover:bg-gray-100 text-sm font-medium text-gray-600 cursor-pointer">
          <span>Seleccionar imagen</span>
          <input 
            type="file" 
            id="image" 
            name="image" 
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
        {selectedFile && (
          <div className="flex flex-col mt-3">
            <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
            <Image
              src={URL.createObjectURL(selectedFile)}
              width={150}
              height={100}
              alt="Preview"
              className="mt-2 border-2 rounded-lg"
            />
          </div>
        )}
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
            placeholder="Ingresa el enlace al video de Youtube"
            className="grow rounded-md border border-gray-200 text-sm placeholder:text-gray"
            aria-describedby="video_url-error"
            ref={videoUrlRef}
          />
          <button type="button" className="rounded-md border p-2 hover:bg-gray-100 text-sm font-medium text-gray-600"
          onClick={()=> {
            if (videoUrlRef.current)
              setPreviewVideoUrl(videoUrlRef.current.value);
          }}>
            <span>Vista previa</span>
          </button>
        </div>
        {previewVideoUrl && (
          <iframe 
            width="250" 
            height="200" 
            src={handleVideoPreview(previewVideoUrl)}
            title="Preview"
            className="mt-2 border-2 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />        
        )}
        <div id="video_url-error" aria-live="polite" aria-atomic="true">
          { state.errors?.video_url && state.errors.video_url.map((error: string) => (
              <p key={error}> { error } </p>
            ))
          }
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Button type="submit">
          Crear ejercicio
        </Button>
        <Link href="/dashboard/exercises" className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Cancelar
        </Link>
      </div>

    </form>
  );
}
