import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';

export default async function CoachDashboard() {
  return (
    <>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard for Coach
      </h1>
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestInvoices /> 
      </Suspense>
    </>
  );
}