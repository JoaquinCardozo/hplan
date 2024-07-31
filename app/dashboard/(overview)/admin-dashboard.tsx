import LatestAthletes from '@/app/ui/dashboard/coach/latest-athletes';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { SessionData } from '@/app/lib/actions';
import { cookies } from "next/headers";

export default async function AdminDashboard() {
  const cookieStore = cookies();
  const cookieData = cookieStore.get("session_data")?.value;
  if (!cookieData) {
    throw new Error("Session data cookie is not set");
  }
  const sessionData = JSON.parse(cookieData as string) as SessionData;
  console.log(sessionData);

  // TODO get all gyms
  const gym_id = sessionData.gymId;
  const gym_name = sessionData.gymName;

  return (
    <>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard for Admin
      </h1>
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestAthletes gymId={gym_id} gymName={gym_name} /> 
      </Suspense>
    </>
  );
}