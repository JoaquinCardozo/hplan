import LatestAthletes from '@/app/ui/dashboard/coach/latest-athletes';
import LatestCoaches from '@/app/ui/dashboard/admin/latest-coaches';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { SessionData } from '@/app/lib/actions';
import { cookies } from "next/headers";
import { fetchAllGyms } from '@/app/lib/data';

export default async function AdminDashboard() {
  const cookieStore = cookies();
  const cookieData = cookieStore.get("session_data")?.value;
  if (!cookieData) {
    throw new Error("Session data cookie is not set");
  }
  const sessionData = JSON.parse(cookieData as string) as SessionData;
  const all_gyms = await fetchAllGyms();

  return (
    <>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard for Admin
      </h1>
      All Gyms:

      { all_gyms.map((gym) => {
          return (
            <div key={gym.id}>
              { gym.name }

              <Suspense fallback={<LatestInvoicesSkeleton />}>
                <LatestCoaches gymId={gym.id} gymName={gym.name} /> 
              </Suspense>

              <Suspense fallback={<LatestInvoicesSkeleton />}>
                <LatestAthletes gymId={gym.id} gymName={gym.name} /> 
              </Suspense>
            </div>
          )
        })
      }
    </>
  );
}