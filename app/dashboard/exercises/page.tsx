import Pagination from '@/app/ui/exercises/pagination';
import Search from '@/app/ui/search';
import ExerciseList from '@/app/ui/exercises/list';
import { CreateExercise } from '@/app/ui/exercises/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ejercicios',
};

export default async function Page({ searchParams }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  //const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Ejercicios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar ejercicio..." />
        <CreateExercise />
      </div>
        <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <ExerciseList query={query} currentPage={currentPage} />
      </Suspense> 
      {/*<div className="mt-5 flex w-full justify-center">
         <Pagination totalPages={totalPages} /> 
      </div>*/}
    </div>
  );
}