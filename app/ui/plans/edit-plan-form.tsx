'use client';

import { Plan, Session } from '@/app/lib/definitions'; 
import { updatePlan, createSession, deleteSession } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function EditPlanForm({ plan }: { plan: Plan }){
  const initialState = { message: null, errors: {} };
  const updatePlanWithId = updatePlan.bind(null, plan.id);
  const [state, action] = useFormState(updatePlanWithId, initialState);

  const [isEditing, setIsEditing] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updatePlan(plan.id, initialState, formData);
    if (result.success) {
      plan.name = result.plan.name;
      plan.description = result.plan.description;
      setIsEditing(false);
    }
  }

  const [addedSessions, setAddedSessions] = useState<Session[]>(plan.sessions || []);

  async function handleAddSession() {
    const newSession : Session = {
      id: '',
      name: 'Día ' + (addedSessions.length + 1),
      description: '',
      position: addedSessions.length > 0 ? addedSessions[addedSessions.length - 1].position + 1 : 0,
      plan_id: plan.id,
      image_url: '',
      video_url: '',
      blocks: []
    };
    const session_id = await createSession(newSession);

    newSession.id = session_id;
    setAddedSessions([...addedSessions, newSession]);
  };

  const [deleteError, setDeleteError] = useState<string>('');

  async function handleDeleteSession(indexToRemove: number) {
    const isConfirmed = window.confirm("¿Borrar esta sesión?");
    if (isConfirmed) {
      const result =  await deleteSession(addedSessions[indexToRemove].id);
      if (result.success) {
        setAddedSessions(addedSessions.filter((_, index) => index !== indexToRemove));
      }
      else {
        setDeleteError(result.message || 'Error desconocido');
      }
    }
  };

  const imageUrlRef = useRef<HTMLInputElement>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>();
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    setPreviewImageUrl(plan.image_url);
    setPreviewVideoUrl(plan.video_url);
  }, [plan.image_url, plan.video_url]);

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
    <div>
      { isEditing ? (
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm">
              Nombre
            </label>
            <input 
              id="name"
              name="name"
              type="text"
              placeholder="Ingresa un nombre"
              defaultValue={plan.name}
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
              defaultValue={plan.description}
              className="w-full rounded-md border border-gray-200 text-sm placeholder:text-gray"
              aria-describedby="description-error"
            />
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
            {!selectedFile && previewImageUrl && (
              <div className="flex flex-col mt-3">
                <Image
                  src={previewImageUrl}
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
                placeholder="Ingresa el enlace al video"
                defaultValue={plan.video_url}
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
                src={handleVideoPreview(previewVideoUrl)}
                title="Preview"
                className="mt-2 border-2 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />        
            )}
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
            <div className="flex flex-col gap-4 w-full">
            <div className="text-lg font-medium">{plan.name}</div>
            <div className="text-sm">{plan.description || "(Sin descripción)"}</div>
            <div className="flex flex-row gap-5 items-center">
              <div className="basis-1/2">
                {plan.image_url ? (
                  <div className="relative w-full mx-auto">
                    <Image
                      src={plan.image_url}
                      alt="Imagen del plan"
                      layout="responsive"
                      width={16}
                      height={9} 
                      className="border-2 rounded-lg object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-full h-[100px] border-2 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="basis-1/2">
                {plan.video_url ? ( 
                  <div className="text-center grow relative w-full max-w-[500px] mt-5 aspect-video">
                    <iframe 
                      src={plan.video_url}
                      title="Preview"
                      className="absolute top-0 left-0 w-full h-full border-2 rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    /> 
                  </div>
                ) : (
                  <div className="w-full h-[100px] border-2 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Sin video</span>
                  </div>
                )}
              </div>
            </div>
           </div>
            <div className="grow text-right">
              <button
                type="button"
                className="rounded-md border p-2 hover:bg-gray-100"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex flex-row items-center">
          <label htmlFor="exercise" className="grow mb-2 block">
            Sesiones
          </label>
          <div className="flex gap-4">
            <button type="button" 
              className="rounded-md border p-2 text-sm font-medium flex bg-black text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              onClick={handleAddSession}
            >
                <span>Agregar sesion</span>
                <PlusIcon className="h-5 ml-2" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          {addedSessions
              .sort((a: Session, b: Session) => a.position - b.position)
              .map((session, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <div className="flex flex-row items-center">
                <div className="flex flex-col">
                  <div className="text-lg font-medium">{session.name}</div>
                  <div className="text-sm">{session.description}</div>
                  {/*<div className="text-sm">Position {session.position}</div>*/}
                </div>
                <div className="grow text-right">
                  <button className="rounded-md border p-2 hover:bg-gray-100">
                    <Link href={`/dashboard/plans/${plan.id}/edit/sessions/${session.id}/edit`}>
                      <PencilIcon className="w-5" />
                    </Link>
                  </button>
                  <button type="button"
                    className="rounded-md border p-2 hover:bg-gray-100"
                    onClick={() => handleDeleteSession(index)}
                  >
                    <TrashIcon className="w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div id="name-error" aria-live="polite" aria-atomic="true" className="text-sm text-red-500 text-right">
          { deleteError &&
            <p key={deleteError}> { deleteError } </p>
          }
        </div>
      </div>

      { addedSessions.length == 0 &&
        <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
          <p className="text-sm text-gray-500 text-center">No hay sesiones</p>
        </div>
      }

      <div className="mt-6 flex justify-center gap-4">
        <Link href="/dashboard/plans/" className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Volver
        </Link>
      </div>
    </div>
  );
}