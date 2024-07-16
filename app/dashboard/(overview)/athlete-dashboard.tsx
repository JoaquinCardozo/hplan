import CardWrapper from '@/app/ui/dashboard/cards';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { CardSkeleton } from '@/app/ui/skeletons';

export default async function AthleteDashboard() {
  return (
    <>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard for Athlete
      </h1>
      <Suspense fallback={<CardSkeleton />}>
        <CardWrapper />
      </Suspense>
    </>
  );
}