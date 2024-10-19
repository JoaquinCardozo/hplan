'use client';

import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import ShowBlock from '@/app/ui/sessions/show-block';
import { Session, SessionBlock } from '@/app/lib/definitions'; 

export default function ShowSession({ session }: { session: Session }){
	
	return (
		<div>
    	<div>
    		<div className="flex flex-col items-center text-center">
          <div className="grow text-2xl font-bold">{session.name}</div>
          <div className="grow text-sm text-gray-400">{session.description || "(Sin descripción)"}</div>
          
          {session.image_url && 
            <div className="relative w-full mx-auto">
              <Image
                src={session.image_url}
                alt="Imagen del plan"
                layout="responsive"
                width={16}
                height={9} 
                className="border-2 rounded-lg object-contain" 
              />
            </div>
          }

          {session.video_url && 
            <div className="text-center grow relative w-full max-w-[500px] mt-5 aspect-video">
              <iframe 
                src={session.video_url}
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
        <div className="mt-4">
          {session.blocks
          		.sort((a: SessionBlock, b: SessionBlock) => a.position - b.position)
          		.map((block, index) => (
            <div key={index} className="mb-4 border rounded-md shadow-sm bg-white">
            	<div className="flex flex-col gap-5">
	              <div className="relative flex flex-row gap-1">
	                <ShowBlock block={block} plan_id={session.plan_id} />
	              </div>
	            </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Link href={`/plans/${session.plan_id}`} className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
          Volver
        </Link>
      </div>
  </div>
  );
}