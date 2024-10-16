'use client';

import { Plan, Session } from '@/app/lib/definitions'; 
import { updatePlan, createSession, deleteSession } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
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
      blocks: []
    };
    const session_id = await createSession(newSession);

    newSession.id = session_id;
    setAddedSessions([...addedSessions, newSession]);
  };

  async function handleDeleteSession(indexToRemove: number) {
    const isConfirmed = window.confirm("¿Borrar esta sesión?");
    if (isConfirmed) {
      const success =  await deleteSession(addedSessions[indexToRemove].id);
      console.log(success)
      if (success) {
        setAddedSessions(addedSessions.filter((_, index) => index !== indexToRemove));
      }
    }
  };

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
          <div className="flex flex-row items-center">
            <div className="flex flex-col">
            <div className="text-lg font-medium">{plan.name}</div>
            <div className="text-sm">{plan.description || "(Sin descripción)"}</div>
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
                  <div className="text-sm">Position {session.position}</div>
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