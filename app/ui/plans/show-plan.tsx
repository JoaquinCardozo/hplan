'use client';

import { Plan, Session } from '@/app/lib/definitions';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ShowPlan({ plan }: { plan: Plan }){
  const [imgError, setImgError] = useState(false);

  return (
    <div>
      <div className="flex flex-row items-center text-center">
        <div className="grow flex flex-col gap-2 items-center text-center">
          {plan.image_url && !imgError ? (
            <div className="relative w-full mx-auto">
              <Image
                src={plan.image_url}
                alt="Imagen del plan"
                layout="responsive"
                width={16}
                height={9} 
                className="border-2 rounded-lg object-contain" 
                onError={() => setImgError(true)}
                // onLoad={() => setImgError(false)}
              />
            </div>
          ) : (
            <Image 
              src="/MobilityProBanner.jpg" 
              alt="Imagen del plan"
              layout="responsive"
              width={16}
              height={9} 
              className="border-2 rounded-lg object-contain" 
            />
          )}
          <div className="mt-5 text-3xl smx:text-2xl font-bold">{plan.name}</div>
          <div className="text-sm text-gray-400">{plan.description || "(Sin descripción)"}</div>

          {plan.video_url && 
            <div className="text-center grow relative w-full max-w-[500px] mt-5 aspect-video">
              <iframe 
                src={plan.video_url}
                title="Preview"
                className="absolute top-0 left-0 w-full h-full border-2 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              /> 
            </div>
          }
        </div>
      </div>

      <div className="mt-6">
        { plan.sessions
            .sort((a: Session, b: Session) => a.position - b.position)
            .map((session, index) => (
          <div key={index} className="mb-4 border rounded-md shadow-sm bg-white">
            <Link href={`/plans/${plan.id}/sessions/${session.id}`}>
              <div className="p-4 flex flex-row items-center hover:bg-gray-100">
                <div className="flex flex-col">
                  <div className="text-lg font-bold">{session.name}</div>
                  <div className="text-sm text-gray-400">{session.description}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      { plan.sessions.length == 0 &&
        <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
          <p className="text-sm text-gray-500 text-center">No hay sesiones</p>
        </div>
      }
    </div>
  );
}