'use client'

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { createPlan, deletePlan } from '@/app/lib/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export function CreatePlan() {
  return (
    <form action={createPlan}>
      <button className="flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
        <span className="hidden md:block">Nuevo plan</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </button>
    </form>
  );
}

export function UpdatePlan({ id }: { id: string }) {
  return (
    <Link
      href={'/dashboard/plans/' + id + '/edit'}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeletePlan({ id }: { id: string }) {
  const deletePlanWithId = async () => {
    const isConfirmed = window.confirm("¿Borrar este plan?");
    if (isConfirmed) {
      deletePlan(id);
    }
  };

  return (
    <form action={deletePlanWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
