import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { LatestInvoice } from '@/app/lib/definitions';
import { fetchLatestGymCoaches } from '@/app/lib/data';

export default async function LatestCoaches({ gymId, gymName }: { gymId: string, gymName: string }){
  const latestCoaches = await fetchLatestGymCoaches(gymId);

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Coaches from {gymName}
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">

         <div className="bg-white px-6">
          {latestCoaches.map((coach, i) => {
            return (
              <div
                key={coach.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={coach.profile_picture_url}
                    alt={`${coach.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {coach.name}
                    </p>
                    <p className="text-sm text-gray-500 sm:block">
                      {coach.email}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
};

