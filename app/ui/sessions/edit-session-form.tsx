'use client';

import { Session, SessionBlock, ExerciseName } from '@/app/lib/definitions'; 
import { updateSession, createSessionBlock, deleteSessionBlock } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import EditBlockForm from '@/app/ui/sessions/edit-block-form';

export default function EditSessionForm({ session, exerciseNames }: { session: Session, exerciseNames: ExerciseName[] }){
	const initialState = { message: null, errors: {} };
  const updateSessionWithId = updateSession.bind(null, session.id);
	const [state, action] = useFormState(updateSessionWithId, initialState);

  const [isEditing, setIsEditing] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateSession(session.id, state, formData);
    if (result.success) {
    	session.name = result.session.name;
	    session.description = result.session.description;
		  setIsEditing(false);	
    }
    else {
    	console.log(result);
    }
  }

	const [addedBlocks, setAddedBlocks] = useState<SessionBlock[]>(session.blocks || []);

  async function handleAddBlock() {
    const newBlock : SessionBlock = {
      id: '',
      name: 'Bloque ' + (addedBlocks.length + 1),
      description: '',
      position: addedBlocks.length > 0 ? addedBlocks[addedBlocks.length - 1].position + 1 : 0,
      session_id: session.id,
      plan_id: session.plan_id,
      workouts: []
    };
    const block_id = await createSessionBlock(newBlock);

    newBlock.id = block_id;
    setAddedBlocks([...addedBlocks, newBlock]);
  };

  async function handleDeleteBlock(indexToRemove: number) {
    const isConfirmed = window.confirm("¿Borrar este bloque?");
    if (isConfirmed) {
      const success =  await deleteSessionBlock(addedBlocks[indexToRemove].id);
      if (success) {
        setAddedBlocks(addedBlocks.filter((_, index) => index !== indexToRemove));
      }
    }
  };

	return (
		<div>
			{ isEditing ? (
    		<form onSubmit={handleSubmit}>
    	
		    	<input id="plan_id" name="plan_id" type="hidden" defaultValue={session.plan_id} />
		    	<input id="position" name="position" type="hidden" defaultValue={session.position} />
		      <div className="mb-4">
		        <label htmlFor="name" className="mb-2 block text-sm">
		          Nombre
		        </label>
		        <input 
		          id="name"
		          name="name"
		          type="text"
		          placeholder="Ingresa un nombre"
		          defaultValue={session.name}
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
		          defaultValue={session.description}
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
	          <div className="text-lg font-medium">{session.name}</div>
	          <div className="text-sm">{session.description || "(Sin descripción)"}</div>
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

	    <div id="name-error" aria-live="polite" aria-atomic="true">
        { state.errors?.description && state.errors.description.map((error: string) => (
            <p key={error}> { error } </p>
          ))
        }
      </div>

      <div className="mt-10 mb-10">
      	<div className="flex flex-row items-center">
          <label htmlFor="exercise" className="grow mb-2 block">
            Bloques
          </label>
          <div className="flex gap-4">
            <button type="button" 
              className="rounded-md border p-2 text-sm font-medium flex bg-black text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              onClick={handleAddBlock}
            >
                <span>Agregar bloque</span>
                <PlusIcon className="h-5 ml-2" />
            </button>
          </div>
         </div>
        {/*<label htmlFor="exercise" className="mb-2 block text-sm">
          Bloques
        </label>
        <div className="flex gap-4">
          <button type="button" 
            className={`rounded-md border p-2 text-sm font-medium flex`}
            onClick={handleAddBlock}
          >
              <span>Agregar bloque</span>
              <PlusIcon className="h-5 ml-2" />
          </button>
        </div>*/}
        <div className="mt-4">
          {addedBlocks
          		.sort((a: SessionBlock, b: SessionBlock) => a.position - b.position)
          		.map((block, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
            	<div className="flex flex-col gap-5">
	              <div className="relative flex flex-row gap-1">
	                <EditBlockForm block={block} plan_id={session.plan_id} exerciseNames={exerciseNames} />
	                <div className="absolute right-0 top-0">
	                  <button type="button"
	                    className="rounded-md border p-2 hover:bg-gray-100"
	                    onClick={() => handleDeleteBlock(index)}
	                  >
	                    <TrashIcon className="w-5" />
	                  </button>
	                </div>
	              </div>
	            </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Link href={`/dashboard/plans/${session.plan_id}/edit`} className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Volver
        </Link>
      </div>
  </div>
  );
}