import Pagination from '@/app/ui/exercises/pagination';
import Search from '@/app/ui/search';
import PlanList from '@/app/ui/plans/list';
import { CreatePlan } from '@/app/ui/plans/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchPlansTotalPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planes',
};

export default async function Page({ searchParams }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPlansTotalPages(query);

  return (
    <main>
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Planes</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Buscar plan..." />
          <CreatePlan />
        </div>
          <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
          <PlanList query={query} currentPage={currentPage} />
        </Suspense> 
        <div className="mt-5 flex w-full justify-center">
           <Pagination totalPages={totalPages} /> 
        </div>
      </div>
    </main>
  );
}