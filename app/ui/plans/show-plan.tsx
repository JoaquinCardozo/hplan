'use client';

import { Plan, Session } from '@/app/lib/definitions';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ShowPlan({ plan }: { plan: Plan }){
  
  return (
    <div>
      <div className="flex flex-row items-center text-center">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">{plan.name}</div>
          <div className="text-sm text-gray-400">{plan.description || "(Sin descripción)"}</div>
          {/* TODO poner imagen en data base */}
          <div className="relative w-full mx-auto">
            <Image
              src="https://cdn.myportfolio.com/4c79adcd-95e3-4625-9f07-35a35068a511/a3eacf07-4ab9-4487-88d6-1467452f5c39.JPG?h=62a1604ccce12f5384763fd412ac3afb"
              alt="Imagen del plan"
              layout="responsive"
              width={16}
              height={9} // Establece una proporción 16:9
              className="border-2 rounded-lg object-contain" 
            />
          </div>
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