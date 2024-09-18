import Pagination from '@/app/ui/exercises/pagination';
import Search from '@/app/ui/search';
import WorkoutList from '@/app/ui/workouts/list';
import { CreateWorkout } from '@/app/ui/workouts/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchWorkoutsTotalPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Circuitos',
};

export default async function Page({ searchParams }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchWorkoutsTotalPages(query);

  return (
    <main>
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Circuitos</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Buscar circuito..." />
          <CreateWorkout />
        </div>
          <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
          <WorkoutList query={query} currentPage={currentPage} />
        </Suspense> 
        <div className="mt-5 flex w-full justify-center">
           <Pagination totalPages={totalPages} /> 
        </div>
      </div>
    </main>
  );
}