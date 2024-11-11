'use client';

import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Cicle, Session } from '@/app/lib/definitions'; 

export default function ShowCicle({ cicle }: { cicle: Cicle }){
	const [imgError, setImgError] = useState(false);

	return (
		<div>
    	<div>
    		<div className="flex flex-col gap-4 items-center text-center">
          <div className="grow text-2xl font-bold">{cicle.name}</div>
          <div className="grow text-sm text-gray-400">{cicle.description || "(Sin descripción)"}</div>
          
          {cicle.image_url && !imgError && 
            <div className="relative w-full mx-auto">
              <Image
                src={cicle.image_url}
                alt="Imagen del plan"
                layout="responsive"
                width={16}
                height={9} 
                className="border-2 rounded-lg object-contain" 
                onError={() => setImgError(true)}
                placeholder = 'empty'
              />
            </div>
          }

          {cicle.video_url && 
            <div className="text-center grow relative w-full max-w-[500px] mt-5 aspect-video">
              <iframe 
                src={cicle.video_url}
                title="Preview"
                className="absolute top-0 left-0 w-full h-full border-2 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              /> 
            </div>
          }
        </div>
      </div>

      <div className="mt-10 mb-10">       
        <div className="mt-6">
          { cicle.sessions
              .sort((a: Session, b: Session) => a.position - b.position)
              .map((session, index) => (
            <div key={index} className="mb-4 border rounded-md shadow-sm bg-white">
              <Link href={`/plans/${cicle.plan_id}/sessions/${session.id}`}>
                <div className="p-4 flex flex-row items-center hover:bg-gray-100 w-[100%]">
                  <div className="flex flex-col w-full text-center gap-1">
                    <div className="text-lg font-bold">{session.name}</div>
                    <div className="text-sm text-gray-400">{session.description}</div>
                    {session.image_url && !imgError &&
                      <div className="max-w-[500px] m-auto"> 
                        <div className="relative w-full mx-auto">
                          <Image
                            src={session.image_url}
                            alt="Imagen del plan"
                            layout="responsive"
                            width={16}
                            height={9} 
                            className="border-2 rounded-lg object-contain" 
                            onError={() => setImgError(true)}
                            placeholder = 'empty'
                          />
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {/*{ cicle.sessions.length == 0 &&
            <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
              <p className="text-sm text-gray-500 text-center">No hay sesiones</p>
            </div>
          }*/}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Link href={`/plans/${cicle.plan_id}`} className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Volver
        </Link>
      </div>
  </div>
  );
}