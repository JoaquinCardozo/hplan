'use client'

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteWorkout } from '@/app/lib/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export function CreateWorkout() {
  return (
    <Link
      href="/dashboard/workouts/create"
      className="flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <span className="hidden md:block">Nuevo circuito</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateWorkout({ id }: { id: string }) {
  return (
    <Link
      href={'/dashboard/workouts/' + id + '/edit'}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteWorkout({ id }: { id: string }) {
  const deleteWorkoutWithId = async () => {
    const isConfirmed = window.confirm("¿Borrar este circuito?");
    if (isConfirmed) {
      deleteWorkout(id);
    }
  };

  return (
    <form action={deleteWorkoutWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
